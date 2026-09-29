#include <stdio.h>
#include <pthread.h>
#include <unistd.h>

#include "threads.h"


/* =========================================================
   THREAD FUNCTION
   ========================================================= */

void *thread_task(void *arg)
{
    int thread_number = *(int *)arg;

    printf("[THREAD] Thread %d started.\n", thread_number);
    printf("[THREAD] Thread ID : %lu\n",
           (unsigned long)pthread_self());

    sleep(1);

    printf("[THREAD] Thread %d completed.\n",
           thread_number);

    return NULL;
}


/* =========================================================
   POSIX THREAD DEMONSTRATION
   ========================================================= */

void demonstrate_threads(void)
{
    printf("\n");
    printf("============================================================\n");
    printf("                 POSIX THREADS\n");
    printf("============================================================\n");

    pthread_t thread1;
    pthread_t thread2;

    int thread_number1 = 1;
    int thread_number2 = 2;

    printf("[THREAD] Creating two POSIX threads...\n");

    if (pthread_create(
            &thread1,
            NULL,
            thread_task,
            &thread_number1) != 0)
    {
        perror("[THREAD] Failed to create thread 1");
        return;
    }

    if (pthread_create(
            &thread2,
            NULL,
            thread_task,
            &thread_number2) != 0)
    {
        perror("[THREAD] Failed to create thread 2");
        pthread_join(thread1, NULL);
        return;
    }

    printf("[THREAD] Both threads created successfully.\n");

    pthread_join(thread1, NULL);
    pthread_join(thread2, NULL);

    printf("[THREAD] Both threads completed.\n");
    printf("[THREAD] POSIX thread demonstration complete.\n");

    printf("============================================================\n");
}
// Shared data used by both threads
int shared_counter = 0;

void *race_condition_task(void *arg)
{
    int thread_number = *(int *)arg;

    printf("[RACE] Thread %d started.\n", thread_number);

    for (int i = 0; i < 1000000; i++)
    {
        shared_counter++;
    }

    printf("[RACE] Thread %d completed.\n", thread_number);

    return NULL;
}

void demonstrate_race_condition(void)
{
    printf("\n");
    printf("============================================================\n");
    printf("              RACE CONDITION DEMONSTRATION\n");
    printf("============================================================\n");

    pthread_t thread1;
    pthread_t thread2;

    int thread_number1 = 1;
    int thread_number2 = 2;

    shared_counter = 0;

    printf("[RACE] Initial shared counter : %d\n", shared_counter);
    printf("[RACE] Each thread increments the counter 1,000,000 times.\n");
    printf("[RACE] Expected final value     : 2000000\n");

    pthread_create(
        &thread1,
        NULL,
        race_condition_task,
        &thread_number1
    );

    pthread_create(
        &thread2,
        NULL,
        race_condition_task,
        &thread_number2
    );

    pthread_join(thread1, NULL);
    pthread_join(thread2, NULL);

    printf("\n[RACE] Actual final value       : %d\n",
           shared_counter);

    if (shared_counter != 2000000)
    {
        printf("[RACE] Race condition detected.\n");
        printf("[RACE] Multiple threads accessed shared data concurrently.\n");
    }
    else
    {
        printf("[RACE] This run produced the expected value.\n");
        printf("[RACE] Race conditions can still occur because ++ is not atomic.\n");
    }

    printf("============================================================\n");
}
pthread_mutex_t counter_mutex = PTHREAD_MUTEX_INITIALIZER;

void *mutex_task(void *arg)
{
    int thread_number = *(int *)arg;

    printf("[MUTEX] Thread %d started.\n", thread_number);

    for (int i = 0; i < 1000000; i++)
    {
        pthread_mutex_lock(&counter_mutex);

        shared_counter++;

        pthread_mutex_unlock(&counter_mutex);
    }

    printf("[MUTEX] Thread %d completed.\n", thread_number);

    return NULL;
}

void demonstrate_mutex(void)
{
    printf("\n");
    printf("============================================================\n");
    printf("             MUTEX SYNCHRONIZATION\n");
    printf("============================================================\n");

    pthread_t thread1;
    pthread_t thread2;

    int thread_number1 = 1;
    int thread_number2 = 2;

    shared_counter = 0;

    printf("[MUTEX] Initial shared counter : %d\n",
           shared_counter);

    printf("[MUTEX] Each thread increments the counter 1,000,000 times.\n");
    printf("[MUTEX] Expected final value     : 2000000\n");

    pthread_create(
        &thread1,
        NULL,
        mutex_task,
        &thread_number1
    );

    pthread_create(
        &thread2,
        NULL,
        mutex_task,
        &thread_number2
    );

    pthread_join(thread1, NULL);
    pthread_join(thread2, NULL);

    printf("\n[MUTEX] Actual final value       : %d\n",
           shared_counter);

    if (shared_counter == 2000000)
    {
        printf("[MUTEX] Shared data protected successfully.\n");
        printf("[MUTEX] Race condition prevented using mutex.\n");
    }
    else
    {
        printf("[MUTEX] Unexpected result.\n");
    }

    printf("============================================================\n");
}
