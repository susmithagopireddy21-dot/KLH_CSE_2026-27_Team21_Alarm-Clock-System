#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "memory.h"

void demonstrate_memory(void)
{
    printf("\n");
    printf("============================================================\n");
    printf("              MEMORY MANAGEMENT\n");
    printf("============================================================\n");

    int size;

    printf("[MEMORY] Enter number of integers to allocate: ");
    scanf("%d", &size);

    if (size <= 0)
    {
        printf("[MEMORY] Invalid allocation size.\n");
        return;
    }

    int *memory_block = malloc(size * sizeof(int));

    if (memory_block == NULL)
    {
        printf("[MEMORY] Memory allocation failed.\n");
        return;
    }

    printf("\n[MEMORY] Dynamic memory allocated successfully.\n");
    printf("[MEMORY] Number of integers : %d\n", size);
    printf("[MEMORY] Size allocated     : %zu bytes\n",
           size * sizeof(int));
    printf("[MEMORY] Starting address   : %p\n",
           (void *)memory_block);

    for (int i = 0; i < size; i++)
    {
        memory_block[i] = (i + 1) * 10;
    }

    printf("\n[MEMORY] Values stored in allocated memory:\n");

    for (int i = 0; i < size; i++)
    {
        printf("  memory[%d] = %d\n",
               i,
               memory_block[i]);
    }

    free(memory_block);

    memory_block = NULL;

    printf("\n[MEMORY] Dynamic memory released using free().\n");
    printf("[MEMORY] Memory pointer reset to NULL.\n");

    printf("============================================================\n");
}
/* =========================================================
   PROCESS MEMORY INSPECTION
   ========================================================= */

void inspect_process_memory(void)
{
    printf("\n");
    printf("============================================================\n");
    printf("             PROCESS VIRTUAL MEMORY\n");
    printf("============================================================\n");

    FILE *memory_file = fopen("/proc/self/status", "r");

    if (memory_file == NULL)
    {
        perror("[MEMORY] Unable to open /proc/self/status");
        return;
    }

    char line[256];

    printf("[MEMORY] Reading Linux process memory information...\n\n");

    while (fgets(line, sizeof(line), memory_file))
    {
        if (strncmp(line, "VmPeak:", 7) == 0 ||
            strncmp(line, "VmSize:", 7) == 0 ||
            strncmp(line, "VmRSS:", 6) == 0 ||
            strncmp(line, "VmData:", 7) == 0 ||
            strncmp(line, "VmStk:", 6) == 0)
        {
            printf("[MEMORY] %s", line);
        }
    }

    fclose(memory_file);

    printf("\n[MEMORY] /proc/self/status belongs to the current process.\n");
    printf("[MEMORY] These values describe its virtual memory usage.\n");

    printf("============================================================\n");
}
