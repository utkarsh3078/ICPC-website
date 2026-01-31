import { EventEmitter } from "events";

/**
 * Service for managing submission status change events
 * Used for real-time updates without constant polling
 */
class SubmissionEventService extends EventEmitter {
  private static instance: SubmissionEventService;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  public static getInstance(): SubmissionEventService {
    if (!SubmissionEventService.instance) {
      SubmissionEventService.instance = new SubmissionEventService();
    }
    return SubmissionEventService.instance;
  }

  /**
   * Emit when a submission status changes
   */
  emitSubmissionUpdate(submissionId: string, status: string, result?: any) {
    this.emit(`submission:${submissionId}`, { status, result });
    this.emit("submission:any", { submissionId, status, result });
  }

  /**
   * Listen for a specific submission status change
   */
  onSubmissionUpdate(submissionId: string, callback: (data: any) => void) {
    this.on(`submission:${submissionId}`, callback);
    return () => this.off(`submission:${submissionId}`, callback);
  }

  /**
   * Listen for any submission status change
   */
  onAnySubmissionUpdate(callback: (data: any) => void) {
    this.on("submission:any", callback);
    return () => this.off("submission:any", callback);
  }
}

export default SubmissionEventService.getInstance();
