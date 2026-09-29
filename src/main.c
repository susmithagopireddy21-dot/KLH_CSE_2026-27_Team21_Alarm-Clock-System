#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <unistd.h>
#include <sys/select.h>
#include <sys/wait.h>

#include "alarm.h"
#include "signals.h"
#include "process.h"
#include "ipc.h"
#include "fifo.h"
#include "memory.h"
#include "filesystem.h"
#include "threads.h"


/* =========================================================
   DISPLAY HEADER
   ========================================================= */

void display_header()
{
    system("clear");

    printf("\n");
    printf("============================================================\n");
    printf("                    CHRONOOS\n");
    printf("              Linux Alarm Management System\n");
    printf("============================================================\n");
}


/* =========================================================
   DISPLAY CURRENT SYSTEM TIME
   ========================================================= */

void display_time()
{
    time_t now;
    struct tm *current_time;

    time(&now);
    current_time = localtime(&now);

    printf("\n------------------------------------------------------------\n");
    printf(" Current Time : %02d:%02d:%02d\n",
           current_time->tm_hour,
           current_time->tm_min,
           current_time->tm_sec);

    printf(" Process ID   : %d\n", getpid());
    printf(" Parent PID   : %d\n", getppid());

    printf("------------------------------------------------------------\n");
}


/* =========================================================
   DISPLAY MENU
   ========================================================= */

void display_menu()
{
    printf("\n");
    printf("                    CONTROL PANEL\n");
    printf("------------------------------------------------------------\n");
    printf("  1. Add Alarm\n");
    printf("  2. View Alarms\n");
    printf("  3. Delete Alarm\n");
    printf("  4. Process Management\n");
    printf("  5. IPC - Anonymous Pipe\n");
    printf("  6. IPC - Named FIFO\n");
    printf("  7. Signal-Based IPC\n");
    printf("  8. Memory Management\n");
printf("  9. File System & I/O\n");
printf(" 10. Memory-Mapped File I/O\n");
printf(" 11. POSIX Threads\n");
printf(" 12. Race Condition\n");
printf(" 13. Mutex Synchronization\n");
printf(" 14. OS Diagnostics\n");
printf(" 15. Exit\n");
  printf("------------------------------------------------------------\n");
    printf(" Enter your choice: ");
}




/* =========================================================
   ALARM NOTIFICATION
   ========================================================= */

void display_alarm_notification()
{
printf("\n\n");
    printf("============================================================\n");
    printf("                    🔔 ALARM TRIGGERED\n");
    printf("============================================================\n");
    printf("\n");
    printf("              *** WAKE UP! YOUR ALARM IS ON ***\n");
    printf("\n");
    printf("============================================================\n");

    printf("\a");
    fflush(stdout);

    sleep(3);

    printf("\n[ALARM] Notification acknowledged.\n");
}


/* =========================================================
   PROCESS MANAGEMENT
   ========================================================= */
pid_t active_alarm_pid = -1;
void check_alarm_process()
{
    if (active_alarm_pid > 0)
    {
        int status;

        pid_t result = waitpid(
            active_alarm_pid,
            &status,
            WNOHANG
        );

        if (result == active_alarm_pid)
        {
            active_alarm_pid = -1;
            printf("[PROCESS] Alarm child process has finished.\n");
        }
    }
}

void process_management()
{
    printf("\n");
    printf("============================================================\n");
    printf("                 PROCESS MANAGEMENT\n");
    printf("============================================================\n");

if (active_alarm_pid > 0)
{
    printf("[OS] Active alarm process detected.\n");
    printf("[OS] Child PID : %d\n", active_alarm_pid);
    printf("[OS] Cancel this alarm? (1 = Yes, 0 = No): ");

    int cancel_choice;
    scanf("%d", &cancel_choice);

    if (cancel_choice == 1)
    {
        cancel_alarm_process(active_alarm_pid);
        active_alarm_pid = -1;

        printf("[OS] Active alarm process cancelled.\n");
        return;
    }
}
    printf("[OS] Creating a child process using fork()...\n");

    int delay;

    printf("[OS] Enter delay in seconds: ");
    scanf("%d", &delay);

    if (delay <= 0)
    {
        printf("[OS] Invalid delay.\n");
        return;
    }

    if (active_alarm_pid > 0)
    {
        printf("[OS] An alarm process is already active.\n");
        printf("[OS] Cancel it before creating another one.\n");
        return;
    }

    active_alarm_pid = create_alarm_process(delay);

    if (active_alarm_pid < 0)
    {
        printf("[!] Failed to create child process.\n");
        return;
    }

    printf("\n[OS] Process creation successful.\n");
    printf("[OS] Parent PID : %d\n", getpid());
    printf("[OS] Child PID  : %d\n", active_alarm_pid);
    printf("[OS] Child is waiting using alarm() and pause().\n");
    printf("[OS] Parent continues execution.\n");
}


/* =========================================================
   OS DIAGNOSTICS
   ========================================================= */

void os_diagnostics()
{
    printf("\n");
    printf("============================================================\n");
    printf("                    OS DIAGNOSTICS\n");
    printf("============================================================\n");

    printf("[OS] Current Process ID : %d\n", getpid());
    printf("[OS] Parent Process ID  : %d\n", getppid());

    printf("\n[OS] Linux process and system interfaces are active.\n");

    printf("============================================================\n");
}

/* =========================================================
   SIGNAL IPC DEMONSTRATION
   ========================================================= */

void signal_ipc_demo()
{
    printf("\n");
    printf("============================================================\n");
    printf("              SIGNAL-BASED IPC\n");
    printf("============================================================\n");

    setup_user_signal();

    pid_t pid = fork();

    if (pid < 0)
    {
        perror("[SIGNAL] fork failed");
        return;
    }

    if (pid == 0)
    {
        /* Child process */

        printf("[SIGNAL] Child process created.\n");
        printf("[SIGNAL] Child PID : %d\n", getpid());
        printf("[SIGNAL] Waiting for SIGUSR1...\n");

        while (!user_signal_received)
        {
            pause();
        }

        printf("\n[SIGNAL] SIGUSR1 received by child.\n");
        printf("[SIGNAL] Asynchronous notification handled successfully.\n");

        _exit(0);
    }

    /* Parent process */

    printf("[SIGNAL] Parent PID : %d\n", getpid());
    printf("[SIGNAL] Child PID  : %d\n", pid);

    sleep(2);

    printf("[SIGNAL] Parent sending SIGUSR1 to child...\n");

    kill(pid, SIGUSR1);

    waitpid(pid, NULL, 0);

    printf("[SIGNAL] Child process completed.\n");
    printf("[SIGNAL] Signal-based IPC demonstration complete.\n");
}


/* =========================================================
   MAIN FUNCTION
   ========================================================= */

int main()
{
    Alarm alarms[MAX_ALARMS];
int alarm_count = 0;
    int choice;

    load_alarms(alarms, &alarm_count);

printf("[FILE] %d alarm(s) loaded from data/alarms.txt\n",
       alarm_count);

    setup_alarm_signal();

    while (1)
    {
check_alarm_process();

        display_header();
        display_time();

        /*
         * Check whether SIGALRM was received.
         */
        if (alarm_triggered)
        {
            alarm_triggered = 0;

            display_alarm_notification();

        }

        display_menu();

        fd_set input_set;

        FD_ZERO(&input_set);
        FD_SET(STDIN_FILENO, &input_set);

        struct timeval timeout;

        timeout.tv_sec = 1;
        timeout.tv_usec = 0;

        int result = select(
            STDIN_FILENO + 1,
            &input_set,
            NULL,
            NULL,
            &timeout
        );

        /*
         * Signal interrupted select().
         */
        if (alarm_triggered)
        {
            continue;
        }

        /*
         * No input yet.
         */
        if (result <= 0)
        {
            continue;
        }

        scanf("%d", &choice);

        switch (choice)
        {
            /* ------------------------------------------------
               ADD ALARM
               ------------------------------------------------ */

            case 1:

                add_alarm(alarms, &alarm_count);

                printf("\nPress Enter to continue...");

                getchar();
                getchar();

                break;


            /* ------------------------------------------------
               VIEW ALARMS
               ------------------------------------------------ */

            case 2:

                view_alarms(
                    alarms,
                    alarm_count
                );

                printf("\nPress Enter to continue...");

                getchar();
                getchar();

                break;


            /* ------------------------------------------------
               DELETE ALARM
               ------------------------------------------------ */

            case 3:

                delete_alarm(
                    alarms,
                    &alarm_count
                );

                printf("\nPress Enter to continue...");

                getchar();
                getchar();

                break;


            /* ------------------------------------------------
               PROCESS MANAGEMENT
               ------------------------------------------------ */

            case 4:

                process_management();

                printf("\nPress Enter to continue...");

                getchar();
                getchar();

                break;


            /* ------------------------------------------------
               ANONYMOUS PIPE
               ------------------------------------------------ */

            case 5:

                printf("\n");
                printf("============================================================\n");
                printf("              ANONYMOUS PIPE IPC\n");
                printf("============================================================\n");

                demonstrate_pipe();

                printf("\nPress Enter to continue...");

                getchar();
                getchar();

                break;


            /* ------------------------------------------------
               NAMED FIFO
               ------------------------------------------------ */

            case 6:

                printf("\n");
                printf("============================================================\n");
                printf("                NAMED FIFO IPC\n");
                printf("============================================================\n");

                demonstrate_fifo();

                printf("\nPress Enter to continue...");

                getchar();
                getchar();

                break;

case 7:

    signal_ipc_demo();

    printf("\nPress Enter to continue...");

    getchar();
    getchar();

    break;

case 8:

    demonstrate_memory();

    printf("\nPress Enter to continue...");

    getchar();
    getchar();

    inspect_process_memory();

    printf("\nPress Enter to continue...");

    getchar();
    getchar();

    break;

case 9:

    demonstrate_file_io();

    printf("\nPress Enter to continue...");

    getchar();
    getchar();

    break;


case 10:

    demonstrate_mmap();

    printf("\nPress Enter to continue...");

    getchar();
    getchar();

    break;


case 11:

    demonstrate_threads();

    printf("\nPress Enter to continue...");

    getchar();
    getchar();

    break;

case 12:

    demonstrate_race_condition();

    printf("\nPress Enter to continue...");

    getchar();
    getchar();

    break;

case 13:

    demonstrate_mutex();

    printf("\nPress Enter to continue...");

    getchar();
    getchar();

    break;

            /* ------------------------------------------------
               OS DIAGNOSTICS
               ------------------------------------------------ */

            case 14:

                os_diagnostics();

                printf("\nPress Enter to continue...");

                getchar();
                getchar();

                break;


            /* ------------------------------------------------
               EXIT
               ------------------------------------------------ */

            case 15:
                alarm(0);

                printf("\n");
                printf("============================================================\n");
                printf("              ChronoOS shutting down...\n");
                printf("============================================================\n");

                return 0;


            /* ------------------------------------------------
               INVALID OPTION
               ------------------------------------------------ */

            default:

                printf("\n[!] Invalid choice.\n");

                sleep(1);

                break;
        }
    }

    return 0;
}
