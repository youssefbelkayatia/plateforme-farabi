package farabi.backend.Controller;

import farabi.backend.Entity.statusUser;
import farabi.backend.Entity.user;
import farabi.backend.Repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "Endpoints for user management and administration")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Operation(summary = "Get all users", description = "Retrieve a list of all users (admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of users retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied - requires admin role")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<user>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @Operation(summary = "Get pending users", description = "Retrieve a list of users with pending status (admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of pending users retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied - requires admin role")
    })
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<user>> getPendingUsers() {
        List<user> pendingUsers = userRepository.findAll()
                .stream()
                .filter(user -> user.getStatus() == statusUser.EN_ATTANTE)
                .toList();
        return ResponseEntity.ok(pendingUsers);
    }

    @Operation(summary = "Approve user", description = "Approve a user with pending status (admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User approved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied - requires admin role"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<user> approveUser(@PathVariable Long id) {
        user user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setStatus(statusUser.ACCEPTE);
        user.setAccept_date(new Date());
        userRepository.save(user);
        
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Reject user", description = "Reject a user with pending status (admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User rejected successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied - requires admin role"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<user> rejectUser(@PathVariable Long id) {
        user user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setStatus(statusUser.REJETE);
        userRepository.save(user);
        
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Get current user", description = "Retrieve the currently authenticated user's information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Current user retrieved successfully",
                    content = @Content(schema = @Schema(implementation = user.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/me")
    public ResponseEntity<user> getCurrentUser() {
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        
        String email = authentication.getName();
        user currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(currentUser);
    }
} 