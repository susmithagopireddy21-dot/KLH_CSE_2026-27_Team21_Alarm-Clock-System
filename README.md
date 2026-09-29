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

ChronoOS is a Linux-based alarm management and time-management system developed using C programming and POSIX/Linux system programming interfaces.

When an alarm is created, the parent process creates a child process using `fork()`. The child process waits for the specified duration using `alarm()` and `pause()`. When the alarm expires, the `SIGALRM` signal is generated and handled by the child process.

The parent process can cancel an active alarm by sending `SIGTERM` using `kill()`. Alarm information is stored in `alarms.txt` using Linux file-system calls such as `open()`, `write()`, `read()`, and `close()`.

ChronoOS also demonstrates anonymous pipes, named FIFOs, signal-based inter-process communication, dynamic memory allocation, memory inspection, memory-mapped files, POSIX threads, race conditions, mutexes, condition variables, semaphores, and deadlock/concurrency hazards.

The project integrates multiple Operating System concepts into a single practical Linux application.

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
* Demonstrate condition variables and semaphores.
* Demonstrate deadlock and concurrency hazards safely.
* Integrate multiple Operating System concepts into one application.

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
* Condition-variable synchronization
* Semaphore-based synchronization
* Deadlock/concurrency hazard demonstration
* Safe deadlock detection using `pthread_mutex_trylock()`

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
* Synchronization Primitives

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

Requirements

The project requires:

Ubuntu/Linux environment
GCC compiler
POSIX-compatible system APIs
POSIX Threads library

The project can be executed directly in Ubuntu or through WSL2 on Windows.

Compilation
gcc -Wall -Wextra src/main.c src/alarm.c src/signals.c src/process.c src/ipc.c src/fifo.c src/memory.c src/filesystem.c src/threads.c -Iinclude -pthread -o chronoos

Execution
./chronoos

The application provides a menu-based interface for demonstrating the implemented Operating System concepts.

Synchronization Demonstrations

The following menu options demonstrate the major thread-synchronization concepts:

13. Mutex Synchronization
14. Condition Variable
15. Semaphore
16. Deadlock / Concurrency Hazard
17. OS Diagnostics
18. Exit

Operating System Concepts Demonstrated
Concept	Implementation
Process Creation	fork()
Process Identification	getpid(), getppid()
Process Synchronization	waitpid()
Alarm Scheduling	alarm()
Signal Handling	SIGALRM, SIGTERM, SIGUSR1
Process Control	kill()
Anonymous IPC	pipe()
Named IPC	mkfifo()
File I/O	open(), read(), write(), close()
Memory Management	malloc(), free()
Memory Inspection	/proc/self/status
Memory Mapping	mmap(), munmap()
Multithreading	POSIX pthread
Race Condition	Shared counter demonstration
Mutex Synchronization	pthread_mutex_lock(), pthread_mutex_unlock()
Condition Variables	pthread_cond_wait(), pthread_cond_signal()
Semaphore Synchronization	sem_wait(), sem_post()
Deadlock / Concurrency Hazard	Opposite lock ordering with pthread_mutex_trylock()

Current Phase Status

Project Phase: Development and OS Concept Integration

Completed
Alarm management
Linux file-based alarm storage
Process creation using fork()
Parent-child process management
alarm() and SIGALRM
Alarm cancellation using SIGTERM
Anonymous pipe
Named FIFO
Signal-based IPC
Dynamic memory demonstration
Process memory inspection
File-system I/O
Memory-mapped file I/O
POSIX threads
Shared data demonstration
Race-condition demonstration
Mutex synchronization
Condition-variable synchronization
Semaphore synchronization
Deadlock/concurrency hazard demonstration
Safe concurrency-hazard detection using pthread_mutex_trylock()
In Progress
Documentation and testing
Integration and final validation

Safety and Repository Guidelines

The repository must not contain:

Passwords
API keys
Access tokens
Private credentials
Confidential institutional data
Licensed datasets that cannot be redistributed

Generated binaries and temporary backup files are excluded through .gitignore.

Future Enhancements
Extended automated testing
Improved documentation
Web-based ChronoOS interface
Integration between the web interface and the Linux-based ChronoOS system
Additional monitoring and reporting features

Team Repository

This project is maintained as a team repository for the KLH CSE 2026-27 academic project.

Each team member contributes through their own GitHub account while following the shared repository structure and version-control workflow.
