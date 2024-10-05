package com.wild.corp.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Base64;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/files")
public class FileUploadController {


    @Value("${image-storage-dir}")
    private Path imageStorageDir;

    @RequestMapping(value = "/", method = RequestMethod.POST)
    public ResponseEntity<String> uploadFile(@RequestParam("evenementId") String evenementId,@RequestParam("fileName") String fileName, @RequestBody String fileContent) throws IOException {

        byte[] imageDecoded = Base64.getDecoder().decode(fileContent.getBytes());
        Path prePath = this.imageStorageDir.resolve(evenementId);

        if (!Files.exists(prePath)) {
            System.out.println(prePath);
            Files.createDirectories(prePath);
        }

        final Path targetPath = prePath.resolve(fileName);
        try (InputStream in = new ByteArrayInputStream(imageDecoded)) {
            try (OutputStream out = Files.newOutputStream(targetPath, StandardOpenOption.CREATE)) {
                in.transferTo(out);
            }
        }

        return new ResponseEntity<>(fileContent, HttpStatus.OK);
    }

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public ResponseEntity<String> uploadFile(@RequestParam("evenementId") String evenementId,@RequestParam("fileName") String fileName) throws IOException {
        Path path =this.imageStorageDir.resolve(evenementId+"/"+fileName);
        String imageEncoded = Base64.getEncoder().encodeToString(Files.newInputStream(path).readAllBytes());

        return new ResponseEntity<>(imageEncoded, HttpStatus.OK);
    }

}