package com.sia.demo.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@Service
public class StorageService {
    private final Path uploadPath;

    public StorageService(@Value("${app.upload.dir}") String uploadDir) {
        try {
            this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(this.uploadPath);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not initialize upload folder", ex);
        }
    }

    public List<String> storeImages(MultipartFile[] images) {
        if (images == null || images.length < 1 || images.length > 3) {
            throw new ResponseStatusException(BAD_REQUEST, "Upload 1 to 3 images");
        }
        List<String> urls = new ArrayList<>();
        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) {
                throw new ResponseStatusException(BAD_REQUEST, "Empty image file");
            }
            urls.add(storeOne(image));
        }
        return urls;
    }

    private String storeOne(MultipartFile file) {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String extension = "";
        int dot = originalFilename.lastIndexOf('.');
        if (dot >= 0) {
            extension = originalFilename.substring(dot);
        }
        String filename = UUID.randomUUID() + extension;
        Path target = uploadPath.resolve(filename).normalize();
        if (!target.startsWith(uploadPath)) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid filename");
        }
        try (InputStream input = file.getInputStream()) {
            Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Failed to store image");
        }
        return "/uploads/" + filename;
    }
}
