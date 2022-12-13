package com.wild.corp.model;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.io.IOException;

public class BenevoleLiteSerializer extends JsonSerializer<Benevole> {

        @Override
        public void serialize(Benevole value, JsonGenerator jsonGenerator, SerializerProvider serializers) throws IOException, JsonProcessingException {
            jsonGenerator.writeStartObject();
            jsonGenerator.writeFieldName("id");
            jsonGenerator.writeNumber(value.getId());
            jsonGenerator.writeEndObject();
        }

}
