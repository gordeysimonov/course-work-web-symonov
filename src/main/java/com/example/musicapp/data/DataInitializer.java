package com.example.musicapp.data;

import com.example.musicapp.model.*;
import com.example.musicapp.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements ApplicationRunner {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final GenreRepository genreRepository;
    private final MusicFileRepository musicFileRepository;
    private final TagRepository tagRepository;
    private final CategoryRepository categoryRepository;
    private final PlaylistRepository playlistRepository;
    private final CommentRepository commentRepository;
    private final NotificationRepository notificationRepository;

    @Autowired
    public DataInitializer(PasswordEncoder passwordEncoder, UserRepository userRepository, GenreRepository genreRepository, MusicFileRepository musicFileRepository, TagRepository tagRepository, CategoryRepository categoryRepository, PlaylistRepository playlistRepository, CommentRepository commentRepository, NotificationRepository notificationRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.genreRepository = genreRepository;
        this.musicFileRepository = musicFileRepository;
        this.tagRepository = tagRepository;
        this.categoryRepository = categoryRepository;
        this.playlistRepository = playlistRepository;
        this.commentRepository = commentRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {

        User user1 = new User();
        user1.setName("Hordii");
        user1.setEmail("western.qu@gmail.com");
        user1.setPassword(passwordEncoder.encode("Veter111"));
        Set<String> roles1 = new HashSet<>();
        roles1.add("ADMIN");
        user1.setRoles(roles1);
        user1.setRegistrationDate(LocalDateTime.parse("2024-12-01T12:34:56"));
        user1.setProfilePicturePath("src/main/resources/static/images/default-profile.jpg");
        userRepository.save(user1);

        User user2 = new User();
        user2.setName("Hanna");
        user2.setEmail("hanna@gmail.com");
        user2.setPassword(passwordEncoder.encode("Veter111"));
        Set<String> roles2 = new HashSet<>();
        roles2.add("USER");
        user2.setRoles(roles2);
        user2.setRegistrationDate(LocalDateTime.parse("2024-12-05T17:21:21"));
        user2.setProfilePicturePath("src/main/resources/static/images/hannazuerst.jpg");
        userRepository.save(user2);

        Genre genre1 = new Genre();
        genre1.setGenre("Rock");
        genre1.setDescription("Energetic music, highlighted by guitar riffs and strong rhythm");
        genreRepository.save(genre1);

        Genre genre2 = new Genre();
        genre2.setGenre("Pop");
        genre2.setDescription("Melodic songs with a wide audience and often infectious rhythms");
        genreRepository.save(genre2);

        Genre genre3 = new Genre();
        genre3.setGenre("Hip Hop");
        genre3.setDescription("Urban music genre featuring rhythmic and rhyming speech");
        genreRepository.save(genre3);

        Genre genre4 = new Genre();
        genre4.setGenre("Electronic");
        genre4.setDescription("Music genre characterized by the use of electronic instruments and technology");
        genreRepository.save(genre4);

        Genre genre5 = new Genre();
        genre5.setGenre("Classical");
        genre5.setDescription("Music genre rooted in Western tradition, typically with complex compositions and orchestration");
        genreRepository.save(genre5);

        Genre genre6 = new Genre();
        genre6.setGenre("Jazz");
        genre6.setDescription("Music genre characterized by improvisation, syncopation, and swing");
        genreRepository.save(genre6);

        Genre genre7 = new Genre();
        genre7.setGenre("Alternate");
        genre7.setDescription("Music that is produced by performers who are outside the musical mainstream, that is typically regarded as more eclectic, original, or challenging than most popular music");
        genreRepository.save(genre7);

        Genre genre8 = new Genre();
        genre8.setGenre("Metal");
        genre8.setDescription("Heavy and aggressive music genre with distorted guitar sounds and powerful vocals");
        genreRepository.save(genre8);

        Genre genre9 = new Genre();
        genre9.setGenre("Country");
        genre9.setDescription("Music genre rooted in American folk traditions, often featuring storytelling lyrics and acoustic instruments");
        genreRepository.save(genre9);

        Genre genre10 = new Genre();
        genre10.setGenre("K-Pop");
        genre10.setDescription("Electrifying genre of pop music that blends energetic rhythms, vibrant performances, and unparalleled style");
        genreRepository.save(genre10);

        Tag tag1 = new Tag();
        tag1.setTagName("#energetic");
        tagRepository.save(tag1);

        Tag tag2 = new Tag();
        tag2.setTagName("#kpop");
        tagRepository.save(tag2);

        Tag tag3 = new Tag();
        tag3.setTagName("#jinx");
        tagRepository.save(tag3);

        Tag tag4 = new Tag();
        tag4.setTagName("#lesserafim");
        tagRepository.save(tag4);

        Tag tag5 = new Tag();
        tag5.setTagName("#d4vd");
        tagRepository.save(tag5);

        Tag tag6 = new Tag();
        tag6.setTagName("#romantic");
        tagRepository.save(tag6);

        Tag tag7 = new Tag();
        tag7.setTagName("#slow");
        tagRepository.save(tag7);

        Tag tag8 = new Tag();
        tag8.setTagName("#melody");
        tagRepository.save(tag8);

        Tag tag9 = new Tag();
        tag9.setTagName("#choreo");
        tagRepository.save(tag9);

        Tag tag10 = new Tag();
        tag10.setTagName("#monster");
        tagRepository.save(tag10);

        Category popCategory = new Category();
        popCategory.setName("POP MUSIC");
        popCategory.setDescription("Музика жанру Поп, яка заряджає позитивом і створює гарний настрій!");
        popCategory.setCategoryImagePath("src/main/resources/static/categories/pop_music.jpg");
        categoryRepository.save(popCategory);

        Category lastWeekCategory = new Category();
        lastWeekCategory.setName("LAST WEEK");
        lastWeekCategory.setDescription("Музичні файли, додані за останній тиждень!");
        lastWeekCategory.setCategoryImagePath("src/main/resources/static/categories/last_week.webp");
        lastWeekCategory.setMusicFiles(new HashSet<>());
        categoryRepository.save(lastWeekCategory);

        Playlist playlist1 = new Playlist();
        playlist1.setName("BEST");
        playlist1.setUserId(user1);
        playlistRepository.save(playlist1);

        MusicFile musicFile1 = new MusicFile();
        musicFile1.setTitle("Klown Bitch");
        musicFile1.setArtist("Faye Mata & Allison Kaplan");
        musicFile1.setYear(2023);
        musicFile1.setDownloadDate(LocalDateTime.parse("2024-11-07T12:32:56"));
        musicFile1.setCoverImage(Files.readAllBytes(Paths.get("src/main/resources/static/covers/klown.jpg")));
        musicFile1.setFileData(Files.readAllBytes(Paths.get("src/main/resources/static/music/klown.mp3")));
        musicFile1.setContentType("audio/mp3");
        musicFile1.setUploadedBy(user1);
        musicFile1.setGenres(new HashSet<>());
        musicFile1.getGenres().add(genre2);
        musicFile1.getGenres().add(genre10);
        musicFile1.setTags(new HashSet<>());
        musicFile1.getTags().add(tag1);
        musicFile1.getTags().add(tag2);
        musicFile1.setCategories(new HashSet<>());
        musicFile1.getCategories().add(popCategory);
        musicFile1.getCategories().add(lastWeekCategory);
        musicFile1.setPlaylists(new HashSet<>());
        musicFile1.getPlaylists().add(playlist1);
        musicFileRepository.save(musicFile1);

        MusicFile musicFile2 = new MusicFile();
        musicFile2.setTitle("Paint The Town Blue");
        musicFile2.setArtist("Ashnikko");
        musicFile2.setYear(2024);
        musicFile2.setDownloadDate(LocalDateTime.parse("2024-12-05T12:32:56"));
        musicFile2.setCoverImage(Files.readAllBytes(Paths.get("src/main/resources/static/covers/paint_the_town_blue.jpg")));
        musicFile2.setFileData(Files.readAllBytes(Paths.get("src/main/resources/static/music/paint_the_town_blue.mp3")));
        musicFile2.setContentType("audio/mp3");
        musicFile2.setUploadedBy(user2);
        musicFile2.setGenres(new HashSet<>());
        musicFile2.getGenres().add(genre1);
        musicFile2.getGenres().add(genre2);
        musicFile2.setTags(new HashSet<>());
        musicFile2.getTags().add(tag1);
        musicFile2.getTags().add(tag3);
        musicFile2.setCategories(new HashSet<>());
        musicFile2.getCategories().add(popCategory);
        musicFile2.getCategories().add(lastWeekCategory);
        musicFile2.setPlaylists(new HashSet<>());
        musicFile2.getPlaylists().add(playlist1);
        musicFileRepository.save(musicFile2);

        MusicFile musicFile3 = new MusicFile();
        musicFile3.setTitle("Perfect Night");
        musicFile3.setArtist("LE SSERAFIM");
        musicFile3.setYear(2023);
        musicFile3.setDownloadDate(LocalDateTime.parse("2024-12-06T12:32:56"));
        musicFile3.setCoverImage(Files.readAllBytes(Paths.get("src/main/resources/static/covers/perfect_night.jpg")));
        musicFile3.setFileData(Files.readAllBytes(Paths.get("src/main/resources/static/music/perfect_night.mp3")));
        musicFile3.setContentType("audio/mp3");
        musicFile3.setUploadedBy(user2);
        musicFile3.setGenres(new HashSet<>());
        musicFile3.getGenres().add(genre10);
        musicFile3.setTags(new HashSet<>());
        musicFile3.getTags().add(tag2);
        musicFile3.getTags().add(tag4);
        musicFile3.setCategories(new HashSet<>());
        musicFile3.getCategories().add(lastWeekCategory);
        musicFileRepository.save(musicFile3);

        MusicFile musicFile4 = new MusicFile();
        musicFile4.setTitle("Dirty Secrets");
        musicFile4.setArtist("d4vd");
        musicFile4.setYear(2022);
        musicFile4.setDownloadDate(LocalDateTime.parse("2024-11-14T12:33:56"));
        musicFile4.setCoverImage(Files.readAllBytes(Paths.get("src/main/resources/static/covers/dirty_secrets.jpg")));
        musicFile4.setFileData(Files.readAllBytes(Paths.get("src/main/resources/static/music/dirty_secrets.mp3")));
        musicFile4.setContentType("audio/mp3");
        musicFile4.setUploadedBy(user1);
        musicFile4.setGenres(new HashSet<>());
        musicFile4.getGenres().add(genre7);
        musicFile4.setTags(new HashSet<>());
        musicFile4.getTags().add(tag5);
        musicFile4.getTags().add(tag6);
        musicFile4.getTags().add(tag7);
        musicFile4.setCategories(new HashSet<>());
        musicFile4.getCategories().add(lastWeekCategory);
        musicFileRepository.save(musicFile4);

        MusicFile musicFile5 = new MusicFile();
        musicFile5.setTitle("Kara Main Theme");
        musicFile5.setArtist("Philip Sheppard");
        musicFile5.setYear(2018);
        musicFile5.setDownloadDate(LocalDateTime.parse("2024-12-02T12:31:56"));
        musicFile5.setCoverImage(Files.readAllBytes(Paths.get("src/main/resources/static/covers/kara.jpg")));
        musicFile5.setFileData(Files.readAllBytes(Paths.get("src/main/resources/static/music/kara.mp3")));
        musicFile5.setContentType("audio/mp3");
        musicFile5.setUploadedBy(user2);
        musicFile5.setGenres(new HashSet<>());
        musicFile5.getGenres().add(genre5);
        musicFile5.setTags(new HashSet<>());
        musicFile5.getTags().add(tag7);
        musicFile5.getTags().add(tag8);
        musicFile5.setCategories(new HashSet<>());
        musicFileRepository.save(musicFile5);

        MusicFile musicFile6 = new MusicFile();
        musicFile6.setTitle("LA DI DA");
        musicFile6.setArtist("EVERGLOW");
        musicFile6.setYear(2020);
        musicFile6.setDownloadDate(LocalDateTime.parse("2024-12-08T12:31:56"));
        musicFile6.setCoverImage(Files.readAllBytes(Paths.get("src/main/resources/static/covers/ladida.jpg")));
        musicFile6.setFileData(Files.readAllBytes(Paths.get("src/main/resources/static/music/ladida.mp3")));
        musicFile6.setContentType("audio/mp3");
        musicFile6.setUploadedBy(user2);
        musicFile6.setGenres(new HashSet<>());
        musicFile6.getGenres().add(genre10);
        musicFile6.setTags(new HashSet<>());
        musicFile6.getTags().add(tag1);
        musicFile6.getTags().add(tag2);
        musicFile6.getTags().add(tag9);
        musicFile6.setCategories(new HashSet<>());
        musicFile6.getCategories().add(lastWeekCategory);
        musicFileRepository.save(musicFile6);

        MusicFile musicFile7 = new MusicFile();
        musicFile7.setTitle("Meet In The Middle");
        musicFile7.setArtist("Diamond Rio");
        musicFile7.setYear(1991);
        musicFile7.setDownloadDate(LocalDateTime.parse("2024-11-21T12:31:56"));
        musicFile7.setCoverImage(Files.readAllBytes(Paths.get("src/main/resources/static/covers/middle.jpg")));
        musicFile7.setFileData(Files.readAllBytes(Paths.get("src/main/resources/static/music/middle.mp3")));
        musicFile7.setContentType("audio/mp3");
        musicFile7.setUploadedBy(user2);
        musicFile7.setGenres(new HashSet<>());
        musicFile7.getGenres().add(genre9);
        musicFile7.setTags(new HashSet<>());
        musicFile7.setCategories(new HashSet<>());
        musicFileRepository.save(musicFile7);

        MusicFile musicFile8 = new MusicFile();
        musicFile8.setTitle("Nightmare");
        musicFile8.setArtist("Set It Off");
        musicFile8.setYear(2012);
        musicFile8.setDownloadDate(LocalDateTime.parse("2024-11-23T12:31:56"));
        musicFile8.setCoverImage(Files.readAllBytes(Paths.get("src/main/resources/static/covers/nightmare.jpg")));
        musicFile8.setFileData(Files.readAllBytes(Paths.get("src/main/resources/static/music/nightmare.mp3")));
        musicFile8.setContentType("audio/mp3");
        musicFile8.setUploadedBy(user1);
        musicFile8.setGenres(new HashSet<>());
        musicFile8.getGenres().add(genre1);
        musicFile8.getGenres().add(genre8);
        musicFile8.setTags(new HashSet<>());
        musicFile8.getTags().add(tag1);
        musicFile8.getTags().add(tag8);
        musicFile8.getTags().add(tag10);
        musicFile8.setCategories(new HashSet<>());
        musicFileRepository.save(musicFile8);

        MusicFile musicFile9 = new MusicFile();
        musicFile9.setTitle("you should see me in a crown");
        musicFile9.setArtist("Billie Eilish");
        musicFile9.setYear(2019);
        musicFile9.setDownloadDate(LocalDateTime.parse("2024-11-16T12:31:56"));
        musicFile9.setCoverImage(Files.readAllBytes(Paths.get("src/main/resources/static/covers/yssmiac.jpg")));
        musicFile9.setFileData(Files.readAllBytes(Paths.get("src/main/resources/static/music/yssmiac.mp3")));
        musicFile9.setContentType("audio/mp3");
        musicFile9.setUploadedBy(user1);
        musicFile9.setGenres(new HashSet<>());
        musicFile9.getGenres().add(genre2);
        musicFile9.setTags(new HashSet<>());
        musicFile9.getTags().add(tag7);
        musicFile9.getTags().add(tag8);
        musicFile9.getTags().add(tag10);
        musicFile9.setCategories(new HashSet<>());
        musicFile9.getCategories().add(popCategory);
        musicFileRepository.save(musicFile9);

        Comment comment1 = new Comment();
        comment1.setCommentText("This is a comment");
        comment1.setPostDate(LocalDateTime.parse("2024-12-08T22:20:56"));
        comment1.setUserId(user2);
        comment1.setMusicFileId(musicFile2);
        commentRepository.save(comment1);

        Notification notification1 = new Notification();
        notification1.setNotificationText("Перше повідомлення (не прочитане)!");
        notification1.setUserId(user1);
        notification1.setStatus("unread");
        notification1.setDateReceiving(LocalDateTime.parse("2024-12-09T13:00:00"));
        notificationRepository.save(notification1);

        Notification notification2 = new Notification();
        notification2.setNotificationText("Друге повідомлення (прочитане)!");
        notification2.setUserId(user1);
        notification2.setStatus("read");
        notification2.setDateReceiving(LocalDateTime.parse("2024-12-09T13:30:00"));
        notificationRepository.save(notification2);

    }
}
