package com.example.musicapp.controller;

import com.example.musicapp.config.JwtExample;
import com.example.musicapp.model.User;
import com.example.musicapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody User user) {
        Optional<User> existingUserName = userService.findByName(user.getName());
        if (existingUserName.isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "name is already in use");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
        Optional<User> existingUserEmail = userService.findByEmail(user.getEmail());
        if (existingUserEmail.isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "email is already in use");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
        if (user.getPassword() == null || user.getPassword().length() < 6 || !user.getPassword().matches(".*\\d.*")) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "wrong password");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
        User newUser = userService.registerUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "User created successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        Optional<User> userOptional = userService.findByName(loginRequest.getName());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                // Генерація токену після успішної автентифікації
                String token = JwtExample.createJWT(user.getId(), user.getName(), user.getRoles());
                return ResponseEntity.ok(new JwtResponse(token));  // Повертаємо токен клієнту
            }
        }

        return ResponseEntity.status(401).body("Невірний логін або пароль");
    }

    public class JwtResponse {
        private String token;

        public JwtResponse(String token) {
            this.token = token;
        }

        public String getToken() {
            return token;
        }
    }

}