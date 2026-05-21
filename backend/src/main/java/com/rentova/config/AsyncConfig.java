package com.rentova.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableAsync // Globally enables Spring's asynchronous multi-threading capabilities
public class AsyncConfig {

    @org.springframework.context.annotation.Primary
    @Bean(name = "taskExecutor") // Explicitly names the bean to clear the WebSocket executor conflict
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        executor.setCorePoolSize(2);        // Keeps 2 background worker threads warm at all times
        executor.setMaxPoolSize(10);       // Scales up to 10 threads under heavy parallel load
        executor.setQueueCapacity(500);    // Allows up to 500 tasks to queue up before applying backpressure
        executor.setThreadNamePrefix("RentovaAsync-"); // Prefix for clear debugging in your logs
        executor.initialize();
        
        return executor;
    }
}