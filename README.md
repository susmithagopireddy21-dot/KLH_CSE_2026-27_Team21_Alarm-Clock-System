# KLH_CSE_2026-27_Team21_Alarm-Clock-System

# ChronoOS – Linux Alarm Management System

## Team Members

| ID Number  | Name                              |
| ---------- | --------------------------------- |
| 2520030201 | G. Susmitha                       |
| 2520030206 | Uppalapati Venkata Naga Varshitha |
| 2520030219 | Ch. Sreeja                        |

**Supervisor:** Mrs. Harika

---

## Abstract

ChronoOS is a Linux-based alarm management and time-management system developed using C and POSIX/Linux system programming concepts. The project demonstrates how operating-system mechanisms such as process creation, signals, inter-process communication, file-system operations, memory management, memory-mapped files, and POSIX threads can be integrated into a practical application.

When an alarm process is created, the parent process creates a child process using `fork()`. The child process waits for the specified duration using `alarm()` and `pause()`. When the timer expires, the operating system generates `SIGALRM`, which is handled by the child process. The parent process can also terminate an active alarm process using `kill()` and `SIGTERM`.

ChronoOS also demonstrates anonymous pipes, named FIFOs, signal-based IPC, dynamic memory allocation, process memory inspection, file I/O using Linux system calls, memory-mapped file I/O, POSIX threads, race conditions, and mutex-based synchronization.

The project is designed to provide a practical demonstration of Linux operating-system concepts through a single integrated application.

---

## Objectives

* Understand Linux process creation and process management.
* Implement parent-child process communication.
* Demonstrate signal handling using POSIX signals.
* Implement alarm scheduling using `alarm()` and `SIGALRM`.
* Demonstrate process termination using `kill()` and `SIGTERM`.
* Implement anonymous pipe communication.
* Implement named FIFO communication.
* Demonstrate signal-based inter-process communication.
* Demonstrate Linux file-system system calls.
* Demonstrate dynamic memory allocation and process memory inspection.
* Implement memory-mapped file I/O using `mmap()`.
* Demonstrate POSIX threads.
* Demonstrate race conditions and mutex synchronization.
* Integrate multiple operating-system concepts into one application.

---

## Features

### Alarm Management

* Add alarms
* View configured alarms
* Delete alarms
* Store alarm information in a file
* Validate alarm time
* Maintain alarm status

### Process Management

* Create child processes using `fork()`
* Display parent and child process IDs
* Wait for alarms using `alarm()` and `pause()`
* Handle `SIGALRM`
* Cancel an active alarm using `SIGTERM`
* Terminate child processes cleanly

### Inter-Process Communication

* Anonymous pipe using `pipe()`
* Named FIFO using `mkfifo()`
* Signal-based communication using POSIX signals

### Memory Management

* Dynamic memory allocation using `malloc()` and `free()`
* Process memory inspection through `/proc`
* Memory-mapped file access using `mmap()`

### File System and I/O

* File creation and opening using `open()`
* File writing using `write()`
* File reading using `read()`
* File closing using `close()`
* Memory-mapped file operations using `mmap()` and `munmap()`

### Thread Synchronization

* POSIX thread creation using `pthread_create()`
* Shared data demonstration
* Race-condition demonstration
* Mutex-based synchronization

---

## Technologies Used

* C Programming
* Linux / Ubuntu
* POSIX APIs
* GCC Compiler
* Linux System Calls
* Process Management
* Signals
* Inter-Process Communication
* POSIX Threads
* File-System APIs
* Memory Management

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
│
├── results/
│
├── reports/
│
└── website/
```

---

## Requirements

The project requires:

* Ubuntu/Linux environment
* GCC compiler
* POSIX-compatible system APIs
* POSIX Threads library

The project can be executed directly in Ubuntu or through WSL2 with Ubuntu.

---

## Compilation

From the project root directory, run:

```bash
gcc -Wall -Wextra src/main.c src/alarm.c src/signals.c src/process.c src/ipc.c src/fifo.c src/memory.c src/filesystem.c src/threads.c -Iinclude -pthread -o chronoos
```

---

## Execution

Run the compiled application using:

```bash
./chronoos
```

The application provides a menu-based interface for demonstrating the implemented operating-system concepts.

---

## Operating System Concepts Demonstrated

| Concept                 | Implementation                           |
| ----------------------- | ---------------------------------------- |
| Process Creation        | `fork()`                                 |
| Process Identification  | `getpid()`, `getppid()`                  |
| Process Synchronization | `waitpid()`                              |
| Alarm Scheduling        | `alarm()`                                |
| Signal Handling         | `SIGALRM`, `SIGTERM`, `SIGUSR1`          |
| Process Control         | `kill()`                                 |
| Anonymous IPC           | `pipe()`                                 |
| Named IPC               | `mkfifo()`                               |
| File I/O                | `open()`, `read()`, `write()`, `close()` |
| Memory Management       | `malloc()`, `free()`                     |
| Memory Inspection       | `/proc/self/status`                      |
| Memory Mapping          | `mmap()`, `munmap()`                     |
| Multithreading          | POSIX `pthread`                          |
| Race Condition          | Shared counter demonstration             |
| Synchronization         | `pthread_mutex_t`                        |

---

## Current Phase Status

**Project Phase:** Development and OS Concept Integration

### Completed

* Alarm management
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
* Race-condition demonstration
* Mutex synchronization

### In Progress

* Additional synchronization mechanisms
* Extended concurrency demonstrations
* Documentation and testing
* Integration and final validation

---

## Safety and Repository Guidelines

The repository must not contain:

* Passwords
* API keys
* Access tokens
* Private credentials
* Confidential institutional data
* Licensed datasets that cannot be redistributed

Generated binaries and temporary backup files are excluded through `.gitignore`.

---

## Future Enhancements

* Advanced synchronization using condition variables and semaphores
* Additional concurrency and deadlock demonstrations
* Extended automated testing
* Improved documentation
* Web-based ChronoOS interface
* Integration between the web interface and the Linux-based ChronoOS components

---

## Team Repository

This project is maintained as a team repository for the KLH CSE 2026–27 academic project.

Each team member contributes through their own GitHub account so that individual contributions can be verified through Git history.
