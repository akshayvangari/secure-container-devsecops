package com.devsecops.platform.repository;

import com.devsecops.platform.entity.KubernetesPod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KubernetesPodRepository extends JpaRepository<KubernetesPod, String> {
    List<KubernetesPod> findByNamespace(String namespace);
}
