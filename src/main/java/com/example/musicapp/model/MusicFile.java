package com.example.musicapp.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
public class MusicFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String artist;
    private int year;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    private byte[] coverImage;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    private byte[] fileData;

    private String contentType;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime downloadDate;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User uploadedBy;

    @ManyToMany
    @JoinTable(
            name = "musicFileGenres",
            joinColumns = @JoinColumn(name="musicFileId", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name="genreId", referencedColumnName = "id")
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Set<Genre> genres;

    @ManyToMany
    @JoinTable(
            name = "musicFileTags",
            joinColumns = @JoinColumn(name="musicFileId", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name="tagId", referencedColumnName = "id")
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Set<Tag> tags;

    @ManyToMany
    @JoinTable(
            name = "musicFileCategories",
            joinColumns = @JoinColumn(name="musicFileId", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name="categoryId", referencedColumnName = "id")
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Set<Category> categories;

    @ManyToMany
    @JoinTable(
            name = "musicFilePlaylists",
            joinColumns = @JoinColumn(name = "musicFileId", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "playlistId", referencedColumnName = "id")
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Set<Playlist> playlists;

    @OneToMany(mappedBy = "musicFileId", cascade = CascadeType.ALL)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private List<Comment> musicFileCommentList;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getArtist() {
        return artist;
    }

    public void setArtist(String artist) {
        this.artist = artist;
    }

    public byte[] getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(byte[] coverImage) {
        this.coverImage = coverImage;
    }

    public byte[] getFileData() {
        return fileData;
    }

    public void setFileData(byte[] fileData) {
        this.fileData = fileData;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public User getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(User uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public Set<Genre> getGenres() {
        return genres;
    }

    public void setGenres(Set<Genre> genres) {
        this.genres = genres;
    }

    public Set<Tag> getTags() {
        return tags;
    }

    public void setTags(Set<Tag> tags) {
        this.tags = tags;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public LocalDateTime getDownloadDate() {
        return downloadDate;
    }

    public void setDownloadDate(LocalDateTime downloadDate) {
        this.downloadDate = downloadDate;
    }

    public Set<Category> getCategories() {
        return categories;
    }

    public void setCategories(Set<Category> categories) {
        this.categories = categories;
    }

    public Set<Playlist> getPlaylists() {
        return playlists;
    }

    public void setPlaylists(Set<Playlist> playlists) {
        this.playlists = playlists;
    }

    public List<Comment> getMusicFileCommentList() {
        return musicFileCommentList;
    }

    public void setMusicFileCommentList(List<Comment> musicFileCommentList) {
        this.musicFileCommentList = musicFileCommentList;
    }
}
