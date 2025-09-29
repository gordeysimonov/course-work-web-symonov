package com.example.musicapp.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.util.*;

public class JwtExample {

    // Секретний ключ для підпису токену
    private static final String SECRET_KEY = "Hjsjad32hSgh3S62pA";

    // Метод для створення JWT
    public static String createJWT(Long id, String username, Set<String> roles) {
        Algorithm algorithm = Algorithm.HMAC256(SECRET_KEY);  // Алгоритм для підпису
        List<String> rolesList = new ArrayList<>(roles);
        return JWT.create()
                .withIssuer("auth0")
                .withSubject(String.valueOf(id))  // Ідентифікатор користувача
                .withClaim("username", username)  // Додаємо ім'я користувача
                .withClaim("roles", rolesList)
                .withIssuedAt(new Date())  // Дата випуску
                .withExpiresAt(new Date(System.currentTimeMillis() + 3600 * 1000))  // Термін дії (1 година)
                .sign(algorithm);  // Підписуємо токен
    }

    // Метод для декодування JWT
    public static DecodedJWT decodeJWT(String token) {
        Algorithm algorithm = Algorithm.HMAC256(SECRET_KEY);
        return JWT.require(algorithm)
                .withIssuer("auth0")
                .build()
                .verify(token);  // Перевірка і декодування
    }
}

