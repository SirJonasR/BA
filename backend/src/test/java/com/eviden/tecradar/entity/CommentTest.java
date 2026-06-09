package com.eviden.tecradar.entity;

import io.quarkus.test.junit.QuarkusTest;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** Tests for Comment entity. */
@QuarkusTest
class CommentTest {

  @Test
  void testGetSetId() {
    Comment comment = new Comment();
    comment.setId(123L);
    Assertions.assertEquals(123L, comment.getId());
  }

  @Test
  void testGetSetContent() {
    Comment comment = new Comment();
    String content = "This is a test comment";
    comment.setContent(content);
    Assertions.assertEquals(content, comment.getContent());
  }

  @Test
  void testGetSetTecswapRevisionId() {
    Comment comment = new Comment();
    comment.setTecswapRevisionId(5);
    Assertions.assertEquals(5, comment.getTecswapRevisionId());
  }

  @Test
  void testGetSetBaseTecswapRevisionId() {
    Comment comment = new Comment();
    comment.setBaseTecswapRevisionId(3);
    Assertions.assertEquals(3, comment.getBaseTecswapRevisionId());
  }

  @Test
  void testGetSetCreationDate() {
    Comment comment = new Comment();
    LocalDateTime now = LocalDateTime.now();
    comment.setCreationDate(now);
    Assertions.assertEquals(now, comment.getCreationDate());
  }

  @Test
  void testGetSetUser() {
    Comment comment = new Comment();
    User user = new User();
    user.setUserName("testuser");
    comment.setUser(user);
    Assertions.assertEquals(user, comment.getUser());
  }

  @Test
  void testGetSetTecSwapElement() {
    Comment comment = new Comment();
    TecSwapElement tecSwapElement = new TecSwapElement();
    tecSwapElement.setId(456L);
    comment.setTecSwapElement(tecSwapElement);
    Assertions.assertEquals(tecSwapElement, comment.getTecSwapElement());
  }

  @Test
  void testGetSetCorrespondingHistory() {
    Comment comment = new Comment();
    History history = new History();
    history.setId(789L);
    comment.setCorrespondingHistory(history);
    Assertions.assertEquals(history, comment.getCorrespondingHistory());
  }

  @Test
  void testGetSetPreviousHistory() {
    Comment comment = new Comment();
    History history = new History();
    history.setId(101L);
    comment.setPreviousHistory(history);
    Assertions.assertEquals(history, comment.getPreviousHistory());
  }
}
