package farabi.backend.Service;

import farabi.backend.DTO.AuthRequest;
import farabi.backend.DTO.AuthResponse;
import farabi.backend.DTO.RegisterRequest;
import farabi.backend.Entity.statusUser;
import farabi.backend.Entity.user;
import farabi.backend.Repository.UserRepository;
import farabi.backend.Security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        // Check if user with the same email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with this email already exists");
        }

        var user = new user();
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setStatus(statusUser.EN_ATTANTE); // By default, users are in pending status
        user.setCreate_date(new Date());

        userRepository.save(user);
        
        var jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getRole().name(), user.getStatus());
    }

    public AuthResponse authenticate(AuthRequest request) {
        try {
            // First check if the user exists
            Optional<user> userOptional = userRepository.findByEmail(request.getEmail());
            if (userOptional.isEmpty()) {
                throw new BadCredentialsException("Invalid email or password");
            }
            
            user user = userOptional.get();
            
            // Verify the password manually
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new BadCredentialsException("Invalid email or password");
            }
            
            // User exists and password matches, generate token regardless of status
            var jwtToken = jwtService.generateToken(user);
            return new AuthResponse(jwtToken, user.getRole().name(), user.getStatus());
            
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }
    
    /**
     * Logout a user by invalidating their JWT token
     * @param token The JWT token to invalidate
     * @return true if the logout was successful
     */
    public boolean logout(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            // Remove the "Bearer " prefix
            String jwtToken = token.substring(7);
            jwtService.invalidateToken(jwtToken);
            return true;
        }
        return false;
    }
} 