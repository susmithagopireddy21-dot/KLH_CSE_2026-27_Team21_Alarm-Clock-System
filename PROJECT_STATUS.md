# ChronoOS – Project Status Report

## Project Title

ChronoOS – Linux Alarm Management System

## Team

| Roll Number | Name |
|---|---|
| 2520030201 | G. Susmitha |
| 2520030206 | Uppalapati Venkata Naga Varshitha |
| 2520030219 | Ch. Sreeja |

**Supervisor:** Mrs. Harika

## Project Status

**Current Phase:** Implementation, Integration, Testing, and Validation — Completed

## Completed Modules

| Module | Status |
|---|---|
| Alarm Management | Completed |
| Process Management | Completed |
| Signal Handling | Completed |
| Anonymous Pipe IPC | Completed |
| Named FIFO IPC | Completed |
| Signal-Based IPC | Completed |
| Memory Management | Completed |
| File System and I/O | Completed |
| Memory-Mapped File I/O | Completed |
| POSIX Threads | Completed |
| Race Condition | Completed |
| Mutex Synchronization | Completed |
| Condition Variable | Completed |
| Semaphore | Completed |
| Deadlock / Concurrency Hazard | Completed |
| OS Diagnostics | Completed |

## Scheduled Alarm Integration

Scheduled alarms are integrated with Linux process management.

The alarm workflow is:

1. The user creates a scheduled alarm.
2. ChronoOS calculates the delay until the scheduled time.
3. A child process is created using `fork()`.
4. The child process installs signal handlers.
5. The child schedules `SIGALRM` using `alarm()`.
6. The child waits using `pause()`.
7. When the alarm expires, `SIGALRM` is received.
8. The child displays the alarm notification and terminates.

The scheduled alarm process was tested successfully with real delays.

## Process Management

The project demonstrates:

- `fork()` for creating child processes
- `getpid()` for obtaining process IDs
- `getppid()` for obtaining the parent process ID
- `SIGALRM` for alarm notification
- `SIGTERM` for alarm cancellation
- `kill()` for sending signals between processes
- `pause()` for waiting for signals

Both alarm triggering and cancellation were tested successfully.

## Synchronization Testing

The following synchronization and concurrency demonstrations were tested successfully:

- Race condition demonstration
- Mutex synchronization
- Condition variable synchronization
- Semaphore synchronization
- Deadlock / concurrency hazard detection

The corresponding test outputs are stored in the `results/` directory.

## Test Evidence

The following result files are maintained in the project:

- `results/race_condition.txt`
- `results/mutex.txt`
- `results/condition_variable.txt`
- `results/semaphore.txt`
- `results/deadlock.txt`

## Functional Validation

The main ChronoOS functionality was validated through the following operations:

1. Add Alarm
2. View Alarms
3. Delete Alarm
4. Process Management
5. Anonymous Pipe
6. Named FIFO
7. Signal-Based IPC
8. Memory Management
9. File System and I/O
10. Memory-Mapped File I/O
11. POSIX Threads
12. Race Condition
13. Mutex Synchronization
14. Condition Variable
15. Semaphore
16. Deadlock / Concurrency Hazard
17. OS Diagnostics

All listed functional demonstrations were tested successfully.

## Project Structure

The project separates source code, header files, data, logs, documentation, test results, reports, and the web interface into dedicated directories.

```text
ChronoOS/
├── src/
├── include/
├── data/
├── logs/
├── docs/
├── results/
├── reports/
├── tests/
├── website/
├── README.md
└── chronoos

## Compilation

The ChronoOS executable was compiled successfully using GCC with POSIX thread support.
gcc -Wall -Wextra src/main.c src/alarm.c src/signals.c src/process.c src/ipc.c src/fifo.c src/memory.c src/filesystem.c src/threads.c -Iinclude -pthread -o chronoos

## Validation

The following validation activities were completed:

Source code compilation
Alarm creation and storage
Scheduled alarm execution
Child process creation
Alarm signal handling
Alarm cancellation
Anonymous pipe communication
Named FIFO communication
Signal-based IPC
Dynamic memory allocation and release
File read/write operations
Memory-mapped file operations
POSIX thread creation
Race condition demonstration
Mutex synchronization
Condition variable synchronization
Semaphore synchronization
Deadlock hazard detection
OS diagnostics
Documentation update
GitHub repository synchronization

## Documentation

The project documentation is maintained in:

README.md
docs/OS_CONCEPTS.md
reports/PROJECT_STATUS.md
results/

## Repository Status

The project has been committed and pushed successfully to the team's GitHub repository.

The working tree is clean and the local main branch is synchronized with the remote repository.

## Conclusion

ChronoOS successfully integrates multiple Linux Operating System concepts into a single C-based application.

The completed project demonstrates process management, signals, inter-process communication, memory management, file-system operations, memory mapping, multithreading, synchronization, and concurrency hazards.
