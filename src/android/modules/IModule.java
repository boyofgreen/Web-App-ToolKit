package com.manifoldjs.webapptoolkit.modules;

public interface IModule {
    Object onMessage(String id, Object data);
    Boolean onNavigationAttempt(String url);
}
