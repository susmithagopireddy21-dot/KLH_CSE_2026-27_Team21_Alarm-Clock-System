#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <sys/types.h>

#include "process.h"

volatile sig_atomic_t child_alarm_triggered = 0;
volatile sig_atomic_t child_alarm_cancelled = 0;

void child_alarm_handler(int signal_number)
{
    if (signal_number == SIGALRM)
    {
        child_alarm_triggered = 1;
    }
}

void child_term_handler(int signal_number)
{
    if (signal_number == SIGTERM)
    {
        child_alarm_cancelled = 1;
    }
}

pid_t create_alarm_process(int delay)
{
    pid_t pid = fork();

    if (pid < 0)
    {
        perror("[PROCESS] fork failed");
        return -1;
    }

    if (pid == 0)
    {
        struct sigaction alarm_action;
        struct sigaction term_action;

        alarm_action.sa_handler = child_alarm_handler;
        sigemptyset(&alarm_action.sa_mask);
        alarm_action.sa_flags = 0;

        term_action.sa_handler = child_term_handler;
        sigemptyset(&term_action.sa_mask);
        term_action.sa_flags = 0;

        sigaction(SIGALRM, &alarm_action, NULL);
        sigaction(SIGTERM, &term_action, NULL);

        printf("\n[PROCESS] Child process created.\n");
        printf("[PROCESS] Child PID  : %d\n", getpid());
        printf("[PROCESS] Parent PID : %d\n", getppid());
        printf("[PROCESS] Waiting %d seconds...\n", delay);

        alarm(delay);

        while (!child_alarm_triggered &&
               !child_alarm_cancelled)
        {
            pause();
        }

        if (child_alarm_triggered)
        {
            printf("\n");
            printf("============================================================\n");
            printf("                    ALARM RINGING\n");
            printf("============================================================\n");
            printf("[ALARM] SIGALRM received by child process.\n");
            printf("[ALARM] Child PID : %d\n", getpid());
            printf("[ALARM] Alarm time expired.\n");
            printf("============================================================\n");

            printf("\a");
            fflush(stdout);
        }

        if (child_alarm_cancelled)
        {
            printf("\n[ALARM] SIGTERM received.\n");
            printf("[ALARM] Alarm cancelled by parent process.\n");
        }

        printf("[PROCESS] Child process terminating.\n");

        exit(0);
    }

    printf("\n[PROCESS] Parent process continues.\n");
    printf("[PROCESS] Parent PID : %d\n", getpid());
    printf("[PROCESS] Child PID  : %d\n", pid);

    return pid;
}

void cancel_alarm_process(pid_t child_pid)
{
    if (child_pid <= 0)
    {
        printf("[PROCESS] No active alarm process.\n");
        return;
    }

    if (kill(child_pid, SIGTERM) == -1)
    {
        perror("[PROCESS] kill failed");
        return;
    }

    printf("\n[PROCESS] SIGTERM sent to child process.\n");
    printf("[PROCESS] Alarm cancellation requested.\n");
}
