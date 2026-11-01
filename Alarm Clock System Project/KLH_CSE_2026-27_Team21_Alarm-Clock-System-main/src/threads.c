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

/* ============================================================
   CONDITION VARIABLE DEMONSTRATION
   ============================================================ */

#include <unistd.h>

pthread_mutex_t condition_mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t condition_variable = PTHREAD_COND_INITIALIZER;

int alarm_event_ready = 0;

void *condition_waiter(void *arg)
{
    (void)arg;

    pthread_mutex_lock(&condition_mutex);

    printf("\n[COND] Worker thread is waiting for alarm event...\n");

    while (!alarm_event_ready)
    {
        pthread_cond_wait(&condition_variable, &condition_mutex);
    }

    printf("[COND] Worker thread received the alarm event.\n");

    pthread_mutex_unlock(&condition_mutex);

    return NULL;
}

void *condition_signaler(void *arg)
{
    (void)arg;

    sleep(2);

    pthread_mutex_lock(&condition_mutex);

    alarm_event_ready = 1;

    printf("[COND] Alarm event generated by signaler thread.\n");

    pthread_cond_signal(&condition_variable);

    pthread_mutex_unlock(&condition_mutex);

    return NULL;
}

void demonstrate_condition_variable(void)
{
    pthread_t waiter_thread;
    pthread_t signaler_thread;

    alarm_event_ready = 0;

    printf("\n");
    printf("============================================================\n");
    printf("              CONDITION VARIABLE DEMONSTRATION\n");
    printf("============================================================\n");

    pthread_create(
        &waiter_thread,
        NULL,
        condition_waiter,
        NULL
    );

    pthread_create(
        &signaler_thread,
        NULL,
        condition_signaler,
        NULL
    );

    pthread_join(waiter_thread, NULL);
    pthread_join(signaler_thread, NULL);

    printf("[COND] Condition variable synchronization completed.\n");

    pthread_mutex_destroy(&condition_mutex);
    pthread_cond_destroy(&condition_variable);

    printf("============================================================\n");
}

/* ============================================================
   SEMAPHORE DEMONSTRATION
   ============================================================ */

#include <semaphore.h>

sem_t alarm_semaphore;

void *semaphore_worker(void *arg)
{
    (void)arg;

    printf("\n[SEM] Worker thread waiting for semaphore...\n");

    sem_wait(&alarm_semaphore);

    printf("[SEM] Worker thread acquired semaphore.\n");
    printf("[SEM] Worker thread accessing shared alarm resource.\n");

    sleep(1);

    printf("[SEM] Worker thread releasing semaphore.\n");

    sem_post(&alarm_semaphore);

    return NULL;
}

void *semaphore_controller(void *arg)
{
    (void)arg;

    sleep(2);

    printf("[SEM] Controller thread releasing semaphore.\n");

    sem_post(&alarm_semaphore);

    return NULL;
}

void demonstrate_semaphore(void)
{
    pthread_t worker_thread;
    pthread_t controller_thread;

    sem_init(&alarm_semaphore, 0, 0);

    printf("\n");
    printf("============================================================\n");
    printf("                  SEMAPHORE DEMONSTRATION\n");
    printf("============================================================\n");

    pthread_create(
        &worker_thread,
        NULL,
        semaphore_worker,
        NULL
    );

    pthread_create(
        &controller_thread,
        NULL,
        semaphore_controller,
        NULL
    );

    pthread_join(worker_thread, NULL);
    pthread_join(controller_thread, NULL);

    sem_destroy(&alarm_semaphore);

    printf("[SEM] Semaphore synchronization completed.\n");
    printf("============================================================\n");
}

/* ============================================================
   DEADLOCK / CONCURRENCY HAZARD DEMONSTRATION
   ============================================================ */

pthread_mutex_t deadlock_mutex_a = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t deadlock_mutex_b = PTHREAD_MUTEX_INITIALIZER;

void *deadlock_thread_one(void *arg)
{
    (void)arg;

    printf("\n[DEADLOCK] Thread 1 attempting to lock Resource A...\n");

    pthread_mutex_lock(&deadlock_mutex_a);

    printf("[DEADLOCK] Thread 1 acquired Resource A.\n");

    sleep(1);

    printf("[DEADLOCK] Thread 1 attempting to lock Resource B...\n");

    if (pthread_mutex_trylock(&deadlock_mutex_b) != 0)
    {
        printf("[DEADLOCK] Thread 1 could not acquire Resource B.\n");
        printf("[DEADLOCK] Potential deadlock detected.\n");
    }
    else
    {
        printf("[DEADLOCK] Thread 1 acquired Resource B.\n");
        pthread_mutex_unlock(&deadlock_mutex_b);
    }

    pthread_mutex_unlock(&deadlock_mutex_a);

    return NULL;
}

void *deadlock_thread_two(void *arg)
{
    (void)arg;

    printf("[DEADLOCK] Thread 2 attempting to lock Resource B...\n");

    pthread_mutex_lock(&deadlock_mutex_b);

    printf("[DEADLOCK] Thread 2 acquired Resource B.\n");

    sleep(1);

    printf("[DEADLOCK] Thread 2 attempting to lock Resource A...\n");

    if (pthread_mutex_trylock(&deadlock_mutex_a) != 0)
    {
        printf("[DEADLOCK] Thread 2 could not acquire Resource A.\n");
        printf("[DEADLOCK] Potential deadlock detected.\n");
    }
    else
    {
        printf("[DEADLOCK] Thread 2 acquired Resource A.\n");
        pthread_mutex_unlock(&deadlock_mutex_a);
    }

    pthread_mutex_unlock(&deadlock_mutex_b);

    return NULL;
}

void demonstrate_deadlock(void)
{
    pthread_t thread_one;
    pthread_t thread_two;

    printf("\n");
    printf("============================================================\n");
    printf("             DEADLOCK / CONCURRENCY HAZARD\n");
    printf("============================================================\n");

    printf("[DEADLOCK] Two threads will request resources in opposite order.\n");
    printf("[DEADLOCK] trylock() is used to safely detect the hazard.\n");

    pthread_create(
        &thread_one,
        NULL,
        deadlock_thread_one,
        NULL
    );

    pthread_create(
        &thread_two,
        NULL,
        deadlock_thread_two,
        NULL
    );

    pthread_join(thread_one, NULL);
    pthread_join(thread_two, NULL);

    pthread_mutex_destroy(&deadlock_mutex_a);
    pthread_mutex_destroy(&deadlock_mutex_b);

    printf("\n[DEADLOCK] Concurrency hazard demonstration completed.\n");
    printf("[DEADLOCK] Program avoided a permanent deadlock.\n");
    printf("============================================================\n");
}
