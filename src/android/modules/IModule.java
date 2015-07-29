package com.manifoldjs.webapptoolkit.modules;

public abstract class IModule {
	public Object onMessage(String id, Object data) {
		return null;
	}

	public boolean shouldAllowRequest(String url) {
		return false;
	}
}
