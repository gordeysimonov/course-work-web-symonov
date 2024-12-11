package com.example.musicapp.controller;

import com.example.musicapp.model.Category;
import com.example.musicapp.model.MusicFile;
import com.example.musicapp.service.CategoryService;
import com.example.musicapp.service.MusicFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private MusicFileService musicFileService;

    // Отримати категорію за id
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.getCategoryById(id);
        // Додаємо музичні файли для цієї категорії
        List<MusicFile> musicFiles = musicFileService.getMusicFilesByCategory(id);
        category.setMusicFiles(new HashSet<>(musicFiles));  // Встановлюємо музику для цієї категорії
        return ResponseEntity.ok(category);
    }

    // Отримати всі категорії
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    // Завантажити зображення категорії
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getCategoryImage(@PathVariable Long id) throws IOException {
        String imagePath = categoryService.getCategoryImagePath(id);
        // Завантажуємо зображення з файлової системи чи іншого джерела за шляхом
        Path path = Paths.get(imagePath);
        byte[] imageBytes = Files.readAllBytes(path);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(imageBytes);
    }
}

