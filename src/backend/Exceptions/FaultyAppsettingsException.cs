/// <summary>
/// This Exception is thrown when something is wrong with the appsettings.json file.
/// </summary>
public class FaultyAppsettingsException : Exception
{
    public FaultyAppsettingsReason Reason { get; }
    public ECode ErrorCode { get; } = ECode.Appsettings_Faulty;

    /// <summary>
    /// Constructor with a reason and message.
    /// </summary>
    /// <param name="reason">The reason why the appsettings.json is faulty. Check the enum for possible reasons.</param>
    /// <param name="message">The message that describes the error.</param>
    public FaultyAppsettingsException(FaultyAppsettingsReason reason, string message)
        : base(message)
    {
        Reason = reason;
    }

    /// <summary>
    /// Constructor with a reason, message and inner exception.
    /// </summary>
    /// <param name="reason">The reason why the appsettings.json is faulty. Check the enum for possible reasons.</param>
    /// <param name="message">The message that describes the error.</param>
    /// <param name="innerException">The inner exception that is the cause of this exception. Might be useful for debugging.</param>
    public FaultyAppsettingsException(FaultyAppsettingsReason reason, string message, Exception innerException)
        : base(message, innerException)
    {
        Reason = reason;
    }
}
