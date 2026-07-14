package org.myspring.backend.controller;

import lombok.RequiredArgsConstructor;
import org.myspring.backend.model.User;
import org.myspring.backend.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @GetMapping
    public User getMe(@AuthenticationPrincipal User user){
        System.out.println("getMe " + user);
        return user;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return service.register(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        return service.verify(user);
    }
}
