# ChronoOS – Linux Alarm Management System

A Linux-based alarm management system developed in C using POSIX/Linux system programming concepts.

## Team Members

| ID Number  | Name                              |
| ---------- | --------------------------------- |
| 2520030201 | G. Susmitha                       |
| 2520030206 | Uppalapati Venkata Naga Varshitha |
| 2520030219 | Ch. Sreeja                        |

**Supervisor:** Mrs. Harika

---

## Abstract

ChronoOS is a Linux-based alarm management and time-management system developed using C programming and POSIX/Linux system programming interfaces.

When a user creates a scheduled alarm, ChronoOS calculates the required delay and creates a child process using `fork()`. The child process waits for the specified duration using `alarm()` and `pause()`. When the scheduled time is reached, the operating system generates the `SIGALRM` signal, which is handled by the child process and produces the alarm notification.

The parent process can also cancel an active alarm by sending `SIGTERM` to the child process using `kill()`.

Alarm information is stored in `data/alarms.txt` using Linux file-system operations such as `open()`, `write()`, `read()`, and `close()`.

In addition to alarm and process management, ChronoOS demonstrates anonymous pipes, named FIFOs, signal-based inter-process communication, dynamic memory allocation, process memory inspection, memory-mapped files, POSIX threads, race conditions, mutex synchronization, condition variables, semaphores, and deadlock/concurrency hazards.

The project integrates multiple Operating System concepts into a single practical Linux application.

---

## Objectives

* Understand Linux process creation and process management.
* Implement parent-child process relationships using `fork()`.
* Implement scheduled alarm execution using `alarm()` and `SIGALRM`.
* Use `pause()` for process waiting.
* Implement signal handling using POSIX signals.
* Implement alarm cancellation using `kill()` and `SIGTERM`.
* Store and manage alarm information using Linux file-system calls.
* Demonstrate anonymous pipe communication.
* Demonstrate named FIFO communication.
* Demonstrate signal-based inter-process communication.
* Demonstrate dynamic memory allocation and deallocation.
* Inspect process memory using Linux `/proc` interfaces.
* Implement memory-mapped file I/O using `mmap()`.
* Demonstrate POSIX thread creation.
* Demonstrate race conditions and their effects on shared data.
* Prevent race conditions using mutex synchronization.
* Demonstrate condition variables and semaphores.
* Demonstrate deadlock/concurrency hazards safely.
* Integrate multiple Operating System concepts into one application.

---

## Features

### 1. Alarm Management

* Add alarms.
* View configured alarms.
* Delete alarms.
* Validate alarm time.
* Store alarm information in `data/alarms.txt`.
* Maintain alarm status.
* Automatically start a scheduled alarm process when an alarm is added.

### 2. Scheduled Alarm Process

The scheduled alarm follows this execution flow:

```text
User adds alarm
      ↓
Alarm information saved to file
      ↓
Calculate delay until scheduled time
      ↓
fork()
      ↓
Child process created
      ↓
alarm(delay)
      ↓
pause()
      ↓
SIGALRM generated
      ↓
Signal handler executes
      ↓
ALARM RINGING
      ↓
Child process terminates
```

If the selected time has already passed for the current day, ChronoOS schedules the alarm for the following day.

### 3. Process Management

* Create child processes using `fork()`.
* Display parent and child process IDs.
* Wait using `alarm()` and `pause()`.
* Handle `SIGALRM`.
* Cancel an active alarm using `SIGTERM`.
* Send signals using `kill()`.
* Monitor child-process completion using `waitpid()`.
* Terminate child processes cleanly.

### 4. Inter-Process Communication

* Anonymous pipe using `pipe()`.
* Named FIFO using `mkfifo()`.
* Signal-based IPC using POSIX signals.

### 5. Memory Management

* Dynamic memory allocation using `malloc()`.
* Dynamic memory release using `free()`.
* Process memory inspection through `/proc`.
* Memory-mapped file access using `mmap()`.
* Release mapped memory using `munmap()`.

### 6. File System and I/O

* File opening using `open()`.
* File writing using `write()`.
* File reading using `read()`.
* File closing using `close()`.
* Memory-mapped file operations using `mmap()` and `munmap()`.

### 7. Thread Synchronization

* POSIX thread creation using `pthread_create()`.
* Shared data demonstration.
* Race-condition demonstration.
* Mutex-based synchronization.
* Condition-variable synchronization.
* Semaphore-based synchronization.
* Deadlock/concurrency hazard demonstration.
* Safe hazard detection using `pthread_mutex_trylock()`.

---

## Technologies Used

* C Programming
* Linux / Ubuntu
* Windows Subsystem for Linux 2 (WSL2)
* POSIX APIs
* GCC Compiler
* Linux System Calls
* Process Management
* POSIX Signals
* Inter-Process Communication
* POSIX Threads
* File-System APIs
* Dynamic Memory Management
* Memory Mapping
* Thread Synchronization

---

## Project Structure

```text
ChronoOS/
│
├── README.md
├── .gitignore
│
├── src/
│   ├── main.c
│   ├── alarm.c
│   ├── process.c
│   ├── signals.c
│   ├── ipc.c
│   ├── fifo.c
│   ├── memory.c
│   ├── filesystem.c
│   └── threads.c
│
├── include/
│   ├── alarm.h
│   ├── process.h
│   ├── signals.h
│   ├── ipc.h
│   ├── fifo.h
│   ├── memory.h
│   ├── filesystem.h
│   └── threads.h
│
├── data/
│   └── alarms.txt
│
├── logs/
│   └── chronoos_io.log
│
├── tests/
│
├── docs/
│   └── OS_CONCEPTS.md
│
├── results/
│   ├── condition_variable.txt
│   ├── deadlock.txt
│   ├── mutex.txt
│   ├── race_condition.txt
│   └── semaphore.txt
│
├── reports/
│   └── PROJECT_STATUS.md
│
└── website/
```

---

## Requirements

The project requires:

* Ubuntu/Linux environment.
* GCC compiler.
* POSIX-compatible system APIs.
* POSIX Threads library.

The project can be executed directly in Ubuntu or through WSL2 on Windows.

---

## Compilation

From the project root, run:

```bash
gcc -Wall -Wextra src/main.c src/alarm.c src/signals.c src/process.c src/ipc.c src/fifo.c src/memory.c src/filesystem.c src/threads.c -Iinclude -pthread -o chronoos
```

---

## Execution

Run the application using:

```bash
./chronoos
```

ChronoOS provides a menu-based control panel containing the implemented Operating System demonstrations.

---

## Control Panel

```text
1.  Add Alarm
2.  View Alarms
3.  Delete Alarm
4.  Process Management
5.  IPC - Anonymous Pipe
6.  IPC - Named FIFO
7.  Signal-Based IPC
8.  Memory Management
9.  File System & I/O
10. Memory-Mapped File I/O
11. POSIX Threads
12. Race Condition
13. Mutex Synchronization
14. Condition Variable
15. Semaphore
16. Deadlock / Concurrency Hazard
17. OS Diagnostics
18. Exit
```

---

## Operating System Concepts Demonstrated

| Operating System Concept      | Implementation                                        |
| ----------------------------- | ----------------------------------------------------- |
| Process Creation              | `fork()`                                              |
| Process Identification        | `getpid()`, `getppid()`                               |
| Process Synchronization       | `waitpid()`                                           |
| Alarm Scheduling              | `alarm()`                                             |
| Process Waiting               | `pause()`                                             |
| Signal Handling               | `SIGALRM`, `SIGTERM`, `SIGUSR1`                       |
| Process Control               | `kill()`                                              |
| Anonymous IPC                 | `pipe()`                                              |
| Named IPC                     | `mkfifo()`                                            |
| File I/O                      | `open()`, `read()`, `write()`, `close()`              |
| Dynamic Memory                | `malloc()`, `free()`                                  |
| Memory Inspection             | `/proc/self/status`                                   |
| Memory Mapping                | `mmap()`, `munmap()`                                  |
| Multithreading                | POSIX `pthread`                                       |
| Race Condition                | Shared counter demonstration                          |
| Mutex Synchronization         | `pthread_mutex_lock()`, `pthread_mutex_unlock()`      |
| Condition Variables           | `pthread_cond_wait()`, `pthread_cond_signal()`        |
| Semaphore Synchronization     | `sem_wait()`, `sem_post()`                            |
| Deadlock / Concurrency Hazard | Opposite lock ordering with `pthread_mutex_trylock()` |

---

## Testing and Validation

All major ChronoOS control-panel functions were executed and validated during integration testing.

### Alarm and Process Testing

* Alarm creation — **PASS**
* Alarm storage — **PASS**
* Alarm viewing — **PASS**
* Alarm deletion — **PASS**
* Scheduled alarm execution — **PASS**
* `fork()` process creation — **PASS**
* `alarm()` and `pause()` — **PASS**
* `SIGALRM` handling — **PASS**
* Alarm cancellation using `SIGTERM` — **PASS**

### IPC Testing

* Anonymous pipe — **PASS**
* Named FIFO — **PASS**
* Signal-based IPC — **PASS**

### Memory and File Testing

* Dynamic memory allocation — **PASS**
* Process memory inspection — **PASS**
* File-system I/O — **PASS**
* Memory-mapped file I/O — **PASS**

### Thread and Synchronization Testing

* POSIX threads — **PASS**
* Race-condition demonstration — **PASS**
* Mutex synchronization — **PASS**
* Condition variable — **PASS**
* Semaphore synchronization — **PASS**
* Deadlock/concurrency hazard detection — **PASS**

### Diagnostics

* OS diagnostics — **PASS**

The scheduled-alarm integration was specifically tested by creating an alarm approximately 33 seconds in the future. The child process was created successfully, waited using `alarm()` and `pause()`, received `SIGALRM`, displayed the alarm notification, and terminated successfully.

---

## Synchronization Demonstrations

The following control-panel options demonstrate thread synchronization and concurrency concepts:

```text
12. Race Condition
13. Mutex Synchronization
14. Condition Variable
15. Semaphore
16. Deadlock / Concurrency Hazard
```

The race-condition demonstration intentionally allows concurrent access to shared data to show the effect of unsynchronized access.

The mutex demonstration protects the shared data and produces the expected synchronized result.

The condition-variable and semaphore demonstrations show controlled coordination between threads.

The deadlock demonstration uses `pthread_mutex_trylock()` to identify a potential deadlock situation while preventing the program from remaining permanently blocked.

---

## Current Project Status

**Project Phase: Implementation, Integration, Testing, and Validation — Completed**

### Completed

* Alarm management
* Scheduled alarm integration
* Linux file-based alarm storage
* Process creation using `fork()`
* Parent-child process management
* `alarm()` and `SIGALRM`
* Alarm cancellation using `SIGTERM`
* Anonymous pipe
* Named FIFO
* Signal-based IPC
* Dynamic memory demonstration
* Process memory inspection
* File-system I/O
* Memory-mapped file I/O
* POSIX threads
* Shared data demonstration
* Race-condition demonstration
* Mutex synchronization
* Condition-variable synchronization
* Semaphore synchronization
* Deadlock/concurrency hazard demonstration
* Safe concurrency-hazard detection
* Integration testing
* Final validation
* GitHub repository integration

---

## Documentation

Additional project documentation is available in:

```text
docs/OS_CONCEPTS.md
reports/PROJECT_STATUS.md
results/
```

These files contain Operating System concept explanations, project status information, and synchronization test results.

---

## Safety and Repository Guidelines

The repository must not contain:

* Passwords
* API keys
* Access tokens
* Private credentials
* Confidential institutional information
* Licensed datasets that cannot be redistributed

Generated binaries and temporary files are excluded through `.gitignore`.

---

## Future Enhancements

Possible future improvements include:

* Extended automated testing.
* Improved alarm scheduling and recurring alarms.
* Enhanced alarm notification mechanisms.
* Web-based ChronoOS interface.
* Integration between the web interface and Linux-based ChronoOS.
* Additional monitoring and reporting features.
* Improved user-interface design.

---

## Team Repository

ChronoOS is maintained as a team repository for the KLH CSE 2026-27 academic project.

Each team member contributes through their GitHub account while following the shared repository structure and version-control workflow.
