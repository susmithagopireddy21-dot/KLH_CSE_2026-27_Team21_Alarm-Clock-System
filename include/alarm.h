#ifndef ALARM_H
#define ALARM_H

#define MAX_ALARMS 20
#define LABEL_SIZE 50

typedef struct
{
    int id;
    int hour;
    int minute;
    char label[LABEL_SIZE];
    int active;
} Alarm;

void add_alarm(Alarm alarms[], int *alarm_count);
void view_alarms(Alarm alarms[], int alarm_count);
void delete_alarm(Alarm alarms[], int *alarm_count);

void save_alarms(Alarm alarms[], int alarm_count);
void load_alarms(Alarm alarms[], int *alarm_count);

#endif

