using System.Net;
using System.Text.Json;
using WorkGrid.Api.DTOs.Common;

namespace WorkGrid.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = (int)HttpStatusCode.InternalServerError;
        var message = "An internal server error occurred. Please try again later.";
        List<string>? errors = null;

        if (exception is AppException appEx)
        {
            statusCode = appEx.StatusCode;
            message = appEx.Message;
            _logger.LogWarning("Handled application exception: {Message} (Status {StatusCode})", message, statusCode);
        }
        else
        {
            _logger.LogError(exception, "Unhandled system exception: {Message}", exception.Message);
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var response = new ApiResponse<object>
        {
            Success = false,
            Message = message,
            StatusCode = statusCode,
            Errors = errors
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
