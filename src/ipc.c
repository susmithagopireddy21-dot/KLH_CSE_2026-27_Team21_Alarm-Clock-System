#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>
#include <string.h>
#include <stdlib.h>

#include "ipc.h"

void demonstrate_pipe(void)
{
    int pipe_fd[2];

    if (pipe(pipe_fd) == -1)
    {
        perror("[IPC] pipe failed");
        return;
    }

    pid_t pid = fork();

    if (pid < 0)
    {
        perror("[IPC] fork failed");
        close(pipe_fd[0]);
        close(pipe_fd[1]);
        return;
    }

    if (pid == 0)
    {
        /* Child process */

        close(pipe_fd[1]);

        char message[100];

        ssize_t bytes_read = read(
            pipe_fd[0],
            message,
            sizeof(message) - 1
        );

        if (bytes_read > 0)
        {
            message[bytes_read] = '\0';

            printf("\n[IPC] Child received message:\n");
            printf("[IPC] Message: %s\n", message);
        }

        close(pipe_fd[0]);

        printf("[IPC] Child process completed.\n");

        _exit(0);
    }

    /* Parent process */

    close(pipe_fd[0]);

    const char message[] =
        "Alarm information sent from ChronoOS parent process.";

    printf("\n[IPC] Anonymous pipe created.\n");
    printf("[IPC] Parent PID : %d\n", getpid());
    printf("[IPC] Child PID  : %d\n", pid);

    write(pipe_fd[1], message, strlen(message));

    printf("[IPC] Parent sent message to child.\n");

    close(pipe_fd[1]);

    waitpid(pid, NULL, 0);

    printf("[IPC] Parent received child completion.\n");
}
