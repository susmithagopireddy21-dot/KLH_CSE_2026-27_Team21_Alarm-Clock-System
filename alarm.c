#include <stdio.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>

#include "alarm.h"

#define ALARM_FILE "data/alarms.txt"

void add_alarm(Alarm alarms[], int *alarm_count)
{
    if (*alarm_count >= MAX_ALARMS)
    {
        printf("\n[!] Maximum number of alarms reached.\n");
        return;
    }

    int hour;
    int minute;

    printf("\n========== ADD NEW ALARM ==========\n");

    printf("Enter hour (0-23): ");
    scanf("%d", &hour);

    printf("Enter minute (0-59): ");
    scanf("%d", &minute);

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59)
    {
        printf("\n[!] Invalid time.\n");
        return;
    }

    alarms[*alarm_count].id = *alarm_count + 1;
    alarms[*alarm_count].hour = hour;
    alarms[*alarm_count].minute = minute;
    alarms[*alarm_count].active = 1;

    printf("Enter alarm label: ");
    scanf(" %49[^\n]", alarms[*alarm_count].label);

    printf("\n[+] Alarm added successfully!\n");
    printf("    ID    : %d\n", alarms[*alarm_count].id);
    printf("    Time  : %02d:%02d\n", hour, minute);
    printf("    Label : %s\n",
           alarms[*alarm_count].label);

    (*alarm_count)++;

    save_alarms(alarms, *alarm_count);
}

void view_alarms(Alarm alarms[], int alarm_count)
{
    printf("\n========== ACTIVE ALARMS ==========\n");

    if (alarm_count == 0)
    {
        printf("\nNo alarms configured.\n");
        return;
    }

    printf("\n%-5s %-10s %-25s %-10s\n",
           "ID", "TIME", "LABEL", "STATUS");

    printf("--------------------------------------------------------\n");

    for (int i = 0; i < alarm_count; i++)
    {
        printf("%-5d %02d:%02d      %-25s %-10s\n",
               alarms[i].id,
               alarms[i].hour,
               alarms[i].minute,
               alarms[i].label,
               alarms[i].active ? "ACTIVE" : "OFF");
    }
}

void delete_alarm(Alarm alarms[], int *alarm_count)
{
    if (*alarm_count == 0)
    {
        printf("\n[!] No alarms available to delete.\n");
        return;
    }

    int id;

    printf("\n========== DELETE ALARM ==========\n");
    printf("Enter alarm ID: ");
    scanf("%d", &id);

    int found = -1;

    for (int i = 0; i < *alarm_count; i++)
    {
        if (alarms[i].id == id)
        {
            found = i;
            break;
        }
    }

    if (found == -1)
    {
        printf("\n[!] Alarm ID not found.\n");
        return;
    }

    for (int i = found; i < *alarm_count - 1; i++)
    {
        alarms[i] = alarms[i + 1];
        alarms[i].id = i + 1;
    }

    (*alarm_count)--;

    save_alarms(alarms, *alarm_count);

    printf("\n[-] Alarm deleted successfully.\n");
}

void save_alarms(Alarm alarms[], int alarm_count)
{
    int fd = open(
        ALARM_FILE,
        O_WRONLY | O_CREAT | O_TRUNC,
        0644
    );

    if (fd == -1)
    {
        perror("[FILE] Unable to open alarms.txt");
        return;
    }

    char buffer[256];

    for (int i = 0; i < alarm_count; i++)
    {
        int length = snprintf(
            buffer,
            sizeof(buffer),
            "%d %02d:%02d %s %d\n",
            alarms[i].id,
            alarms[i].hour,
            alarms[i].minute,
            alarms[i].label,
            alarms[i].active
        );

        write(fd, buffer, length);
    }

    close(fd);

    printf("[FILE] Alarm information saved to data/alarms.txt\n");
}

void load_alarms(Alarm alarms[], int *alarm_count)
{
    int fd = open(ALARM_FILE, O_RDONLY);

    if (fd == -1)
    {
        return;
    }

    char buffer[4096];

    ssize_t bytes_read = read(
        fd,
        buffer,
        sizeof(buffer) - 1
    );

    close(fd);

    if (bytes_read <= 0)
    {
        return;
    }

    buffer[bytes_read] = '\0';

    *alarm_count = 0;

    char *line = strtok(buffer, "\n");

    while (line != NULL &&
           *alarm_count < MAX_ALARMS)
    {
        int id;
        int hour;
        int minute;
        int active;
        char label[LABEL_SIZE];

        if (sscanf(
                line,
                "%d %d:%d %49[^\n] %d",
                &id,
                &hour,
                &minute,
                label,
                &active) == 5)
        {
            alarms[*alarm_count].id = id;
            alarms[*alarm_count].hour = hour;
            alarms[*alarm_count].minute = minute;
            alarms[*alarm_count].active = active;

            /*
             * Remove the final active-status number
             * from the label.
             */
            char *last_space = strrchr(label, ' ');

            if (last_space != NULL)
            {
                *last_space = '\0';
            }

            strncpy(
                alarms[*alarm_count].label,
                label,
                LABEL_SIZE - 1
            );

            alarms[*alarm_count].label[LABEL_SIZE - 1] = '\0';

            (*alarm_count)++;
        }

        line = strtok(NULL, "\n");
    }
}
