# ChronoOS – Operating System Concepts

ChronoOS demonstrates multiple Linux and POSIX Operating System concepts through a menu-driven C application.

## 1. Process Management

ChronoOS uses `fork()` to create a child process for an alarm.

The parent process continues execution while the child process waits for the alarm duration.

APIs demonstrated:

- `fork()`
- `getpid()`
- `getppid()`
- `waitpid()`

## 2. Alarm and Signal Handling

The child process uses `alarm()` and `pause()` to wait for the alarm event.

When the timer expires, `SIGALRM` is delivered and handled using a signal handler.

Alarm cancellation is demonstrated using:

- `kill()`
- `SIGTERM`

## 3. Inter-Process Communication

ChronoOS demonstrates:

- Anonymous pipes using `pipe()`
- Named FIFO communication using `mkfifo()`
- Signal-based IPC using POSIX signals

## 4. Memory Management

The project demonstrates dynamic memory allocation using:

- `malloc()`
- `free()`

Process memory information is inspected through `/proc/self/status`.

## 5. File System and I/O

ChronoOS demonstrates Linux file-system operations using:

- `open()`
- `read()`
- `write()`
- `close()`

Alarm and system information are stored and accessed using Linux file operations.

## 6. Memory-Mapped File I/O

The project demonstrates memory-mapped file access using:

- `mmap()`
- `munmap()`

This provides an example of accessing file contents through mapped memory.

## 7. POSIX Threads

ChronoOS uses POSIX threads through:

- `pthread_create()`
- `pthread_join()`

Multiple threads are used to demonstrate shared data and synchronization.

## 8. Race Condition

Two threads concurrently modify shared data without synchronization.

The demonstration shows the difference between the expected and actual counter values, illustrating how concurrent access can cause lost updates.

## 9. Mutex Synchronization

A mutex is used to protect shared data.

The demonstration shows that protecting the critical section allows the shared counter to reach the expected final value.

## 10. Condition Variable

A worker thread waits for an alarm event using a condition variable.

Another thread generates the event and signals the waiting thread.

APIs demonstrated:

- `pthread_cond_wait()`
- `pthread_cond_signal()`

## 11. Semaphore

A semaphore controls access to a shared alarm resource.

The worker thread waits for the semaphore while the controller thread releases it.

APIs demonstrated:

- `sem_wait()`
- `sem_post()`

## 12. Deadlock and Concurrency Hazard

Two threads request resources in opposite orders, demonstrating a potential deadlock situation.

ChronoOS uses `pthread_mutex_trylock()` to detect the hazard without allowing the program to remain permanently blocked.

## Conclusion

ChronoOS integrates process management, signals, inter-process communication, memory management, file-system operations, multithreading, and synchronization into one Linux-based Operating System project.
