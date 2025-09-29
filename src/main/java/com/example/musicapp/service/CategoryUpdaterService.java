package com.example.musicapp.service;

import com.example.musicapp.model.Category;
import com.example.musicapp.model.MusicFile;
import com.example.musicapp.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
public class CategoryUpdaterService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MusicFileService musicFileService;

    // Оновлення категорії "LAST WEEK"
    @Scheduled(cron = "0 0/15 * * * *") // Кожні 15 хвилин
    @Transactional
    public void updateLastWeekCategory() {
        Category lastWeekCategory = categoryRepository.findByName("LAST WEEK");
        if (lastWeekCategory != null) {
            Set<MusicFile> oldFiles = new HashSet<>(lastWeekCategory.getMusicFiles());
            for (MusicFile file : oldFiles) {
                lastWeekCategory.getMusicFiles().remove(file);
                file.getCategories().remove(categoryRepository.findByName("LAST WEEK"));
            }

            Set<MusicFile> newFilesForLastWeek = new HashSet<>();
            for (MusicFile file : musicFileService.getAllMusicFiles()) {
                if (file.getDownloadDate().isAfter(LocalDateTime.now().minusWeeks(1))) {
                    newFilesForLastWeek.add(file);
                    file.getCategories().add(lastWeekCategory);
                }
            }
            lastWeekCategory.getMusicFiles().addAll(newFilesForLastWeek);

            categoryRepository.save(lastWeekCategory);
        }
    }

}
