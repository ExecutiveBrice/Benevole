package com.wild.corp.controller;

import com.wild.corp.model.Evenement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Base64;
import java.util.Objects;

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