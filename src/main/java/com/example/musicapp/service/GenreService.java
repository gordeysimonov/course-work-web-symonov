package com.example.musicapp.service;

import com.example.musicapp.model.Genre;
import com.example.musicapp.repository.GenreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GenreService {

    @Autowired
    private GenreRepository genreRepository;

    public List<Genre> getAllGenres() {
        return genreRepository.findAll();
    }

    public Set<Genre> findGenresByIds(List<Long> genreIds) {
        return genreRepository.findAllById(genreIds).stream().collect(Collectors.toSet());
    }
}

