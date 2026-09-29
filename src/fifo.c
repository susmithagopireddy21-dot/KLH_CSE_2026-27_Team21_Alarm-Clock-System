#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <string.h>
#include <stdlib.h>

#include "fifo.h"

#define FIFO_PATH "data/chronoos_fifo"

void demonstrate_fifo(void)
{
    /*
     * Create the named FIFO.
     */
    if (mkfifo(FIFO_PATH, 0666) == -1)
    {
        /*
         * FIFO may already exist from an earlier run.
         * That is not an error for our demonstration.
         */
        printf("[FIFO] FIFO already exists. Reusing it.\n");
    }
    else
    {
        printf("[FIFO] Named FIFO created: %s\n", FIFO_PATH);
    }

    pid_t pid = fork();

    if (pid < 0)
    {
        perror("[FIFO] fork failed");
        return;
    }

    if (pid == 0)
    {
        /*
         * Child = FIFO reader
         */
        printf("[FIFO] Child process waiting for message...\n");

        int fd = open(FIFO_PATH, O_RDONLY);

        if (fd == -1)
        {
            perror("[FIFO] open for reading failed");
            exit(1);
        }

        char message[100];

        ssize_t bytes_read = read(
            fd,
            message,
            sizeof(message) - 1
        );

        if (bytes_read > 0)
        {
            message[bytes_read] = '\0';

            printf("\n[FIFO] Child received message:\n");
            printf("[FIFO] Message: %s\n", message);
        }

        close(fd);

        printf("[FIFO] Child completed FIFO communication.\n");

        exit(0);
    }

    /*
     * Parent = FIFO writer
     */
    sleep(1);

    printf("[FIFO] Parent PID : %d\n", getpid());
    printf("[FIFO] Child PID  : %d\n", pid);

    int fd = open(FIFO_PATH, O_WRONLY);

    if (fd == -1)
    {
        perror("[FIFO] open for writing failed");
        waitpid(pid, NULL, 0);
        return;
    }

    const char message[] =
        "Alarm notification sent through named FIFO.";

    write(fd, message, strlen(message));

    printf("[FIFO] Parent sent message through named FIFO.\n");

    close(fd);

    waitpid(pid, NULL, 0);

    printf("[FIFO] Parent received child completion.\n");

    /*
     * Remove FIFO after demonstration.
     */
    unlink(FIFO_PATH);

    printf("[FIFO] Named FIFO removed after communication.\n");
}
