using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using WorkGrid.Api.Data;
using WorkGrid.Api.DTOs;
using WorkGrid.Api.Entities;
using WorkGrid.Api.Middleware;
using WorkGrid.Api.Repositories;
using WorkGrid.Api.Services;
using Xunit;

namespace WorkGrid.Tests;

public class AuthTests
{
    private static (AuthService authService, AppDbContext dbContext) CreateTestSetup()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var dbContext = new AppDbContext(options);
        var unitOfWork = new UnitOfWork(dbContext);

        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Jwt:SecretKey", "Test_Secret_Key_For_Unit_Testing_WorkGrid_2026!" },
            { "Jwt:Issuer", "TestIssuer" },
            { "Jwt:Audience", "TestAudience" },
            { "Jwt:ExpirationHours", "1" }
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var authService = new AuthService(unitOfWork, configuration);
        return (authService, dbContext);
    }

    [Fact]
    public async Task RegisterAsync_ValidRequest_CreatesUserAndReturnsToken()
    {
        // Arrange
        var (authService, _) = CreateTestSetup();
        var request = new RegisterRequest
        {
            Name = "John Doe",
            Email = "john@example.com",
            Password = "Password123!",
            Role = UserRole.DEVELOPER
        };

        // Act
        var response = await authService.RegisterAsync(request);

        // Assert
        Assert.NotNull(response);
        Assert.False(string.IsNullOrWhiteSpace(response.Token));
        Assert.Equal("john@example.com", response.User.Email);
        Assert.Equal(UserRole.DEVELOPER, response.User.Role);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsBadRequestException()
    {
        // Arrange
        var (authService, _) = CreateTestSetup();
        var request = new RegisterRequest
        {
            Name = "Duplicate User",
            Email = "duplicate@example.com",
            Password = "Password123!",
            Role = UserRole.DEVELOPER
        };

        await authService.RegisterAsync(request);

        // Act & Assert
        await Assert.ThrowsAsync<BadRequestException>(() => authService.RegisterAsync(request));
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsJwtToken()
    {
        // Arrange
        var (authService, _) = CreateTestSetup();
        await authService.RegisterAsync(new RegisterRequest
        {
            Name = "Jane Doe",
            Email = "jane@example.com",
            Password = "ValidPassword123!",
            Role = UserRole.MANAGER
        });

        // Act
        var loginResponse = await authService.LoginAsync(new LoginRequest
        {
            Email = "jane@example.com",
            Password = "ValidPassword123!"
        });

        // Assert
        Assert.NotNull(loginResponse);
        Assert.False(string.IsNullOrWhiteSpace(loginResponse.Token));
        Assert.Equal("Jane Doe", loginResponse.User.Name);
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ThrowsUnauthorizedAppException()
    {
        // Arrange
        var (authService, _) = CreateTestSetup();
        await authService.RegisterAsync(new RegisterRequest
        {
            Name = "Jane Doe",
            Email = "jane@example.com",
            Password = "ValidPassword123!",
            Role = UserRole.MANAGER
        });

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAppException>(() => authService.LoginAsync(new LoginRequest
        {
            Email = "jane@example.com",
            Password = "WrongPassword!"
        }));
    }
}
