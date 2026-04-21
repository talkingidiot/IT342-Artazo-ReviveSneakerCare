package com.sia.demo.service;

import com.sia.demo.dto.GitHubUserDto;
import com.sia.demo.model.Role;
import com.sia.demo.model.User;
import com.sia.demo.repository.UserRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Optional;
import java.util.UUID;

@Service
public class OAuth2Service {
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final String githubClientId;
    private final String githubClientSecret;
    private final PasswordEncoder passwordEncoder;

    public OAuth2Service(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${spring.security.oauth2.client.registration.github.clientId}") String githubClientId,
            @Value("${spring.security.oauth2.client.registration.github.clientSecret}") String githubClientSecret
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.githubClientId = githubClientId;
        this.githubClientSecret = githubClientSecret;
        this.restTemplate = new RestTemplate();
    }

    public String getGithubClientId() {
        return githubClientId;
    }

    /**
     * Exchange GitHub authorization code for access token and user info
     */
    public GitHubUserDto getGitHubUser(String code) {
        // Step 1: Exchange code for access token
        String accessToken = exchangeCodeForToken(code);

        // Step 2: Get user information using access token
        return fetchGitHubUserInfo(accessToken);
    }

    /**
     * Get or create user from GitHub OAuth2 information
     */
    public User getOrCreateGitHubUser(GitHubUserDto gitHubUser) {
        Optional<User> existingUser = userRepository.findByProviderAndProviderId("github", gitHubUser.getId().toString());
        String resolvedEmail = resolveGitHubEmail(gitHubUser);

        if (existingUser.isPresent()) {
            // Update existing user with latest info
            User user = existingUser.get();
            user.setName(gitHubUser.getName() != null ? gitHubUser.getName() : gitHubUser.getLogin());
            user.setAvatarUrl(gitHubUser.getAvatarUrl());
            if (user.getEmail() == null || user.getEmail().isBlank()) {
                user.setEmail(resolvedEmail);
            }
            if (user.getPassword() == null || user.getPassword().isBlank()) {
                user.setPassword(generateOAuthPlaceholderPassword());
            }
            return userRepository.save(user);
        }

        // If the account already exists by email, link it to GitHub.
        Optional<User> existingByEmail = userRepository.findByEmail(resolvedEmail);
        if (existingByEmail.isPresent()) {
            User user = existingByEmail.get();
            user.setProvider("github");
            user.setProviderId(gitHubUser.getId().toString());
            user.setName(gitHubUser.getName() != null ? gitHubUser.getName() : gitHubUser.getLogin());
            user.setAvatarUrl(gitHubUser.getAvatarUrl());
            if (user.getPassword() == null || user.getPassword().isBlank()) {
                user.setPassword(generateOAuthPlaceholderPassword());
            }
            return userRepository.save(user);
        }

        // Create new user
        User newUser = new User();
        newUser.setProvider("github");
        newUser.setProviderId(gitHubUser.getId().toString());
        newUser.setEmail(resolvedEmail);
        newUser.setName(gitHubUser.getName() != null ? gitHubUser.getName() : gitHubUser.getLogin());
        newUser.setAvatarUrl(gitHubUser.getAvatarUrl());
        newUser.setPassword(generateOAuthPlaceholderPassword());
        newUser.setRole(Role.CLIENT);

        return userRepository.save(newUser);
    }

    private String resolveGitHubEmail(GitHubUserDto gitHubUser) {
        if (gitHubUser.getEmail() != null && !gitHubUser.getEmail().isBlank()) {
            return gitHubUser.getEmail().trim().toLowerCase();
        }

        // GitHub may hide email in /user response; provide deterministic fallback.
        String login = gitHubUser.getLogin() != null ? gitHubUser.getLogin().trim().toLowerCase() : "github-user";
        return login + "+" + gitHubUser.getId() + "@users.noreply.github.com";
    }

    private String generateOAuthPlaceholderPassword() {
        return passwordEncoder.encode("oauth2-github-" + UUID.randomUUID());
    }

    private String exchangeCodeForToken(String code) {
        String tokenUrl = "https://github.com/login/oauth/access_token";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/json");
        headers.set("Content-Type", "application/x-www-form-urlencoded");

        String body = String.format(
                "client_id=%s&client_secret=%s&code=%s",
                githubClientId,
                githubClientSecret,
                code
        );

        HttpEntity<String> request = new HttpEntity<>(body, headers);
        ResponseEntity<GitHubTokenResponse> response = restTemplate.exchange(
                tokenUrl,
                HttpMethod.POST,
                request,
                GitHubTokenResponse.class
        );

        if (response.getBody() != null && response.getBody().getAccessToken() != null) {
            return response.getBody().getAccessToken();
        }

        throw new RuntimeException("Failed to exchange code for access token");
    }

    private GitHubUserDto fetchGitHubUserInfo(String accessToken) {
        String userInfoUrl = "https://api.github.com/user";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "token " + accessToken);
        headers.set("Accept", "application/vnd.github.v3+json");

        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<GitHubUserDto> response = restTemplate.exchange(
                userInfoUrl,
                HttpMethod.GET,
                request,
                GitHubUserDto.class
        );

        if (response.getBody() != null) {
            return response.getBody();
        }

        throw new RuntimeException("Failed to fetch GitHub user information");
    }

    public static class GitHubTokenResponse {
        @JsonProperty("access_token")
        private String accessToken;
        @JsonProperty("token_type")
        private String tokenType;
        private String scope;

        public String getAccessToken() {
            return accessToken;
        }

        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }

        public String getTokenType() {
            return tokenType;
        }

        public void setTokenType(String tokenType) {
            this.tokenType = tokenType;
        }

        public String getScope() {
            return scope;
        }

        public void setScope(String scope) {
            this.scope = scope;
        }
    }
}
