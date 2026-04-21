package com.sia.demo.controller;

import com.sia.demo.dto.GitHubUserDto;
import com.sia.demo.dto.OAuth2CallbackResponse;
import com.sia.demo.model.User;
import com.sia.demo.security.JwtService;
import com.sia.demo.service.OAuth2Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.servlet.view.RedirectView;

@Controller
@RequestMapping("/api/auth/oauth2")
public class OAuth2CallbackController {
    private static final Logger log = LoggerFactory.getLogger(OAuth2CallbackController.class);

    private final OAuth2Service oauth2Service;
    private final JwtService jwtService;
    private final String frontendCallbackUrl;

    public OAuth2CallbackController(
            OAuth2Service oauth2Service,
            JwtService jwtService,
            @Value("${app.oauth2.frontend-callback-url:http://localhost:5173/oauth/callback}") String frontendCallbackUrl
    ) {
        this.oauth2Service = oauth2Service;
        this.jwtService = jwtService;
        this.frontendCallbackUrl = frontendCallbackUrl;
    }

    /**
     * Starts OAuth2 authorization by redirecting user to GitHub.
     * Frontend should point to this endpoint instead of constructing GitHub URL directly.
     */
    @GetMapping("/authorize/github")
    public RedirectView authorizeGitHub() {
        String githubUrl = String.format(
                "https://github.com/login/oauth/authorize?client_id=%s&scope=user:email",
                oauth2Service.getGithubClientId()
        );
        return new RedirectView(githubUrl);
    }

    /**
     * GitHub OAuth2 callback endpoint
     * Called by GitHub after user authorizes the application
     */
    @GetMapping("/callback/github")
    public RedirectView githubCallback(
            @RequestParam String code,
            @RequestParam(required = false) String state
    ) {
        try {
            // Step 1: Exchange code for GitHub user info
            GitHubUserDto gitHubUser = oauth2Service.getGitHubUser(code);

            // Step 2: Get or create user
            User user = oauth2Service.getOrCreateGitHubUser(gitHubUser);

            // Step 3: Generate JWT token
            String token = jwtService.generateToken(user);

            // Step 4: Redirect to frontend with token and user info
            String redirectUrl = UriComponentsBuilder
                    .fromUriString(frontendCallbackUrl)
                    .queryParam("token", token)
                    .queryParam("user", user.getName() != null ? user.getName() : "")
                    .queryParam("email", user.getEmail() != null ? user.getEmail() : "")
                    .queryParam("provider", "github")
                    .queryParam("avatar", user.getAvatarUrl() != null ? user.getAvatarUrl() : "")
                    .build()
                    .encode()
                    .toUriString();

            return new RedirectView(redirectUrl);

        } catch (Exception e) {
            log.error("GitHub OAuth callback failed", e);
            // Redirect with safe, generic error text to avoid header injection characters.
            String errorRedirectUrl = UriComponentsBuilder
                    .fromUriString(frontendCallbackUrl)
                    .queryParam("error", "OAuth login failed")
                    .build()
                    .encode()
                    .toUriString();
            return new RedirectView(errorRedirectUrl);
        }
    }

    /**
     * REST endpoint for OAuth2 authentication status check (optional)
     */
    @GetMapping("/status")
    public OAuth2CallbackResponse getOAuth2Status() {
        // This can be used by frontend to check if user is authenticated
        return null;
    }
}
