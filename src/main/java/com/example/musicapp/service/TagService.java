package com.example.musicapp.service;

import com.example.musicapp.model.MusicFile;
import com.example.musicapp.model.Tag;
import com.example.musicapp.repository.MusicFileRepository;
import com.example.musicapp.repository.TagRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private MusicFileRepository musicFileRepository;

    @Transactional(readOnly = true)
    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    public Tag createTag(String tagName) {
        Tag tag = new Tag();
        tag.setTagName(tagName);
        return tagRepository.save(tag);
    }

    public void addTagsToMusicFile(Long musicFileId, Set<String> tagNames) {
        MusicFile musicFile = musicFileRepository.findById(musicFileId)
                .orElseThrow(() -> new EntityNotFoundException("Файл не знайдено"));

        Set<Tag> tags = new HashSet<>();
        for (String tagName : tagNames) {
            Tag tag = tagRepository.findByTagName(tagName).orElseGet(() -> {
                Tag newTag = new Tag();
                newTag.setTagName(tagName);
                return tagRepository.save(newTag);
            });
            tags.add(tag);
        }

        for (Tag tag : tags) {
            musicFile.getTags().add(tag);
        }
        musicFileRepository.save(musicFile);
    }

}

