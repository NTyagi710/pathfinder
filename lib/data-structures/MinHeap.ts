/**
 * Binary min-heap. Smaller `f` wins; equal `f` breaks toward smaller `h`.
 * Keys are read only while the heap moves a node. For greedy search, insert with `f = h`.
 * ponytail: no decrease-key — insert another copy when an open node gets a better g.
 */
export class MinHeap<T extends { f: number; h: number }> {
  private heap: T[] = [];

  insert(node: T): void {
    if (!Number.isFinite(node.f) || !Number.isFinite(node.h)) {
      throw new Error("MinHeap: f and h must be finite numbers");
    }
    this.heap.push(node);
    this.siftUp(this.heap.length - 1);
  }

  extractMin(): T {
    const heap = this.heap;
    if (heap.length === 0) {
      throw new Error("MinHeap is empty");
    }
    const min = heap[0];
    const last = heap.pop() as T;
    if (heap.length > 0) {
      heap[0] = last;
      this.siftDown(0);
    }
    return min;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  size(): number {
    return this.heap.length;
  }

  private siftUp(i: number): void {
    const heap = this.heap;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!before(heap[i], heap[parent])) return;
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    }
  }

  private siftDown(i: number): void {
    const heap = this.heap;
    const n = heap.length;
    while (true) {
      const left = (i << 1) + 1;
      if (left >= n) return;
      const right = left + 1;
      const best =
        right < n && before(heap[right], heap[left]) ? right : left;
      if (!before(heap[best], heap[i])) return;
      [heap[i], heap[best]] = [heap[best], heap[i]];
      i = best;
    }
  }
}

function before<T extends { f: number; h: number }>(a: T, b: T): boolean {
  return a.f < b.f || (a.f === b.f && a.h < b.h);
}
