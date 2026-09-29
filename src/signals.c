#include <stdio.h>
#include <signal.h>

#include "signals.h"


/* Flag for SIGALRM */
volatile sig_atomic_t alarm_triggered = 0;


/* Flag for SIGUSR1 */
volatile sig_atomic_t user_signal_received = 0;


/* =========================================================
   SIGALRM HANDLER
   ========================================================= */

void alarm_signal_handler(int signal_number)
{
    if (signal_number == SIGALRM)
    {
        alarm_triggered = 1;
    }
}


/* =========================================================
   SIGALRM SETUP
   ========================================================= */

void setup_alarm_signal(void)
{
    struct sigaction sa;

    sa.sa_handler = alarm_signal_handler;

    sigemptyset(&sa.sa_mask);

    sa.sa_flags = 0;

    sigaction(SIGALRM, &sa, NULL);
}


/* =========================================================
   SIGUSR1 HANDLER
   ========================================================= */

void user_signal_handler(int signal_number)
{
    if (signal_number == SIGUSR1)
    {
        user_signal_received = 1;
    }
}


/* =========================================================
   SIGUSR1 SETUP
   ========================================================= */

void setup_user_signal(void)
{
    struct sigaction sa;

    sa.sa_handler = user_signal_handler;

    sigemptyset(&sa.sa_mask);

    sa.sa_flags = 0;

    sigaction(SIGUSR1, &sa, NULL);
}
