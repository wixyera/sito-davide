// Deadline-based timer: background tabs do not make the session run slower.
export class FocusTimer {
  constructor(minutes = 25, now = () => Date.now()) {
    this.now = now;
    this.setDuration(minutes);
  }
  setDuration(minutes) {
    if (!Number.isFinite(minutes) || minutes <= 0) throw new RangeError('Invalid timer duration');
    this.duration = Math.round(minutes * 60 * 1000);
    this.reset();
  }
  reset() { this.remainingMs = this.duration; this.deadline = null; this.finished = false; }
  start() {
    if (this.deadline !== null) return;
    if (this.remainingMs <= 0) this.reset();
    this.deadline = this.now() + this.remainingMs;
    this.finished = false;
  }
  pause() {
    this.snapshot();
    this.deadline = null;
  }
  snapshot() {
    if (this.deadline !== null) {
      this.remainingMs = Math.max(0, this.deadline - this.now());
      if (this.remainingMs === 0) { this.deadline = null; this.finished = true; }
    }
    return { seconds: Math.ceil(this.remainingMs / 1000), progress: 1 - this.remainingMs / this.duration, running: this.deadline !== null, finished: this.finished };
  }
}
