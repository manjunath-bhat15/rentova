package com.rentova;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RentovaApplication {

	public static void main(String[] args) {
		SpringApplication.run(RentovaApplication.class, args);
	}

}
