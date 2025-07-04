/// <summary>
/// A controlled exception that can be used to handle specific error cases in a structured way. (Error codes)
/// </summary>
/// <param name="message">The error message to be displayed.</param>
/// <param name="eCode">The error code associated with the exception. Check the enums for allowed error codes</param>

public class ControlledException(string message, ECode eCode) : Exception(message)
{
    public ECode ECode { get; set; } = eCode;
    public DateTime ThrownAt { get; set; } = DateTime.UtcNow;
    public bool IsError { get; } = true;
}