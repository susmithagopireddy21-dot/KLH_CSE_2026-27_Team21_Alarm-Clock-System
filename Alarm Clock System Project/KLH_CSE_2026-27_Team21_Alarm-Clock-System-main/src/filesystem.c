#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>
#include <sys/mman.h>
#include <sys/stat.h>

#include "filesystem.h"

#define LOG_FILE "logs/chronoos_io.log"

void demonstrate_file_io(void)
{
    printf("\n");
    printf("============================================================\n");
    printf("                LINUX FILE I/O\n");
    printf("============================================================\n");

    const char message[] =
        "ChronoOS file system demonstration completed.\n";

    /*
     * Open or create the file.
     */
    int fd = open(
        LOG_FILE,
        O_WRONLY | O_CREAT | O_APPEND,
        0644
    );

    if (fd == -1)
    {
        perror("[FILE] open failed");
        return;
    }

    printf("[FILE] File opened successfully.\n");
    printf("[FILE] File descriptor : %d\n", fd);

    /*
     * Write data using the Linux write() system call.
     */
    ssize_t bytes_written = write(
        fd,
        message,
        strlen(message)
    );

    if (bytes_written == -1)
    {
        perror("[FILE] write failed");
        close(fd);
        return;
    }

    printf("[FILE] Data written successfully.\n");
    printf("[FILE] Bytes written : %zd\n", bytes_written);

    /*
     * Close the file descriptor.
     */
    close(fd);

    printf("[FILE] File descriptor closed.\n");

    /*
     * Reopen the file for reading.
     */
    fd = open(LOG_FILE, O_RDONLY);

    if (fd == -1)
    {
        perror("[FILE] reopen failed");
        return;
    }

    printf("[FILE] File reopened for reading.\n");
    printf("[FILE] File descriptor : %d\n", fd);

    char buffer[256];

    ssize_t bytes_read = read(
        fd,
        buffer,
        sizeof(buffer) - 1
    );

    if (bytes_read == -1)
    {
        perror("[FILE] read failed");
        close(fd);
        return;
    }

    buffer[bytes_read] = '\0';

    printf("\n[FILE] Data read from file:\n");
    printf("--------------------------------------------\n");
    printf("%s", buffer);
    printf("--------------------------------------------\n");

    close(fd);

    printf("[FILE] File descriptor closed.\n");

    printf("\n[FILE] File I/O demonstration completed.\n");

    printf("============================================================\n");
}

/* =========================================================
   MEMORY-MAPPED FILE I/O
   ========================================================= */

void demonstrate_mmap(void)
{
    printf("\n");
    printf("============================================================\n");
    printf("             MEMORY-MAPPED FILE I/O\n");
    printf("============================================================\n");

    int fd = open(
        LOG_FILE,
        O_RDWR
    );

    if (fd == -1)
    {
        perror("[MMAP] open failed");
        return;
    }

    struct stat file_info;

    if (fstat(fd, &file_info) == -1)
    {
        perror("[MMAP] fstat failed");
        close(fd);
        return;
    }

    if (file_info.st_size == 0)
    {
        printf("[MMAP] File is empty.\n");
        close(fd);
        return;
    }

    size_t file_size = (size_t)file_info.st_size;

    char *mapped_data = mmap(
        NULL,
        file_size,
        PROT_READ | PROT_WRITE,
        MAP_SHARED,
        fd,
        0
    );

    if (mapped_data == MAP_FAILED)
    {
        perror("[MMAP] mmap failed");
        close(fd);
        return;
    }

    printf("[MMAP] File mapped successfully.\n");
    printf("[MMAP] File size : %zu bytes\n", file_size);
    printf("[MMAP] Mapped address : %p\n",
           (void *)mapped_data);

    printf("\n[MMAP] Data accessed through mapped memory:\n");
    printf("--------------------------------------------\n");
    printf("%.*s",
           (int)file_size,
           mapped_data);
    printf("--------------------------------------------\n");

    if (munmap(mapped_data, file_size) == -1)
    {
        perror("[MMAP] munmap failed");
        close(fd);
        return;
    }

    close(fd);

    printf("\n[MMAP] Memory mapping released using munmap().\n");
    printf("[MMAP] File descriptor closed.\n");
    printf("[MMAP] Memory-mapped I/O demonstration completed.\n");

    printf("============================================================\n");
}
