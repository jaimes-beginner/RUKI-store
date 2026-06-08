package com.ruki.user.requests;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

// AQUÍ PONEMOS EL FORMATO DE COMO QUEREMOS ENVIAR LOS USUARIOS, EN 
// ESTE CASO LO QUE QUEREMOS ENVIAR SON USUARIOS CON UN ÍNDICE Y CON 
// SU RESPECTIVA CANTIDAD DE PÁGINAS

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageResponse<T> {

    private List<T> content;       // LISTA DE USUARIOS
    private int pageNumber;        // NÚMERO DE LA PAGINA ACTUAL
    private int pageSize;          // CANTIDAD DE ELEMENTOS QUE HABRÁ POR PÁGINA
    private long totalElements;    // CUANTOS ELEMENTOS HAY EN TOTAL
    private int totalPages;        // CUANTAS PÁGINAS HAY EN TOTAL
    private boolean last;          // SI LA PAGINA ACTUAL ES LA ÚLTIMA O NO

}