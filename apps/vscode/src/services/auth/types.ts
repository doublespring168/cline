/**
 * Enum defining different reasons why a user might be logged out
 * Used by model-specific authentication services to describe logout causes.
 */
export enum LogoutReason {
	/** User explicitly clicked logout button in UI */
	USER_INITIATED = "user_initiated",
	/** Unknown or unspecified reason */
	UNKNOWN = "unknown",
}
