package com.example.musicapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf().disable()
                .authorizeRequests()
                .requestMatchers("/login", "/register", "/api/users/**", "/api/music-files/**", "/api/genres/**", "/api/music-files/user/**", "/api/categories/**", "/api/playlists/**", "/api/playlists/user/**", "/api/comments/**", "/api/subscriptions/**", "/api/notifications/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN") // Доступ лише для адміністраторів
                .anyRequest().authenticated()
                .and()
                .formLogin().disable();

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}


