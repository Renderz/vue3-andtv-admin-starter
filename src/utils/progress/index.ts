import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const style =
  'display: block;width: 100%;height: 100%;opacity: 0.4;filter: alpha(opacity=40);background: #FFF;position: fixed;top: 0;left: 0;z-index: 2000;';

const template =
  '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner" style="top: 50%;right: 50%"><div class="spinner-icon"></div></div>';

NProgress.configure({
  template,
});

class Progress {
  private container: HTMLElement;
  private mask: HTMLElement;
  private queue: number[];

  constructor(getContainer?: () => HTMLElement) {
    this.container = getContainer?.() || document.body;
    this.mask = document.createElement('div');
    this.mask.setAttribute('style', style);
    this.queue = [];
  }

  private appendMask() {
    this.container.appendChild(this.mask);
  }

  private removeMask() {
    this.container.removeChild(this.mask);
  }

  private queueIn(id: number) {
    this.queue.push(id);
  }

  private queueOut(id: number) {
    this.queue.splice(
      this.queue.findIndex((v) => v === id),
      1,
    );
  }

  start() {
    const queueId = Date.now();
    const prevLength = this.queue.length;

    this.queueIn(queueId);

    if (prevLength === 0) {
      NProgress.start();
      this.appendMask();
    }

    return () => {
      this.queueOut(queueId);

      const currLength = this.queue.length;

      if (currLength === 0) {
        NProgress.done();
        this.removeMask();
      }
    };
  }
}

export default Progress;
