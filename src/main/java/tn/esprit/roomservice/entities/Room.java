package tn.esprit.roomservice.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Integer capacity;

    private String equipment; // exemple: "Projector, AC, TV"

    private Boolean available;
}