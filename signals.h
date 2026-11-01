#ifndef SIGNALS_H
#define SIGNALS_H

#include <signal.h>

extern volatile sig_atomic_t alarm_triggered;
extern volatile sig_atomic_t user_signal_received;

void setup_alarm_signal(void);
void alarm_signal_handler(int signal_number);

void setup_user_signal(void);
void user_signal_handler(int signal_number);

#endif
