namespace WorkGrid.Api.Middleware;

public class AppException : Exception
{
    public int StatusCode { get; }

    public AppException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string message) : base(message, 404)
    {
    }
}

public class ForbiddenException : AppException
{
    public ForbiddenException(string message = "You do not have permission to perform this action.") : base(message, 403)
    {
    }
}

public class BadRequestException : AppException
{
    public BadRequestException(string message) : base(message, 400)
    {
    }
}

public class UnauthorizedAppException : AppException
{
    public UnauthorizedAppException(string message = "Invalid email or password.") : base(message, 401)
    {
    }
}
