package com.sia.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GitHubUserDto {
    private Long id;
    private String login;
    private String email;
    private String name;
    @JsonProperty("avatar_url")
    private String avatarUrl;
}
