#ifndef PROCESS_H
#define PROCESS_H

#include <sys/types.h>

pid_t create_alarm_process(int delay);
void cancel_alarm_process(pid_t child_pid);

#endif
